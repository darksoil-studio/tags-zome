use hdi::prelude::*;

pub mod tag_to_taggeds;
pub use tag_to_taggeds::*;
pub mod tags_path;
pub use tags_path::*;

#[derive(Serialize, Deserialize)]
#[hdk_link_types]
pub enum LinkTypes {
    TagToTaggeds,
    TaggedToTags,
    TagsPath,
}

// Validation you perform during the genesis process. Nobody else on the network performs it, only you.
// There *is no* access to network calls in this callback
#[hdk_extern]
pub fn genesis_self_check(_data: GenesisSelfCheckData) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}

// Validation the network performs when you try to join, you can't perform this validation yourself as you are not a member yet.
// There *is* access to network calls in this function
pub fn validate_agent_joining(
    _agent_pub_key: AgentPubKey,
    _membrane_proof: &Option<MembraneProof>,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}

// This is the unified validation callback for all entries and link types in this integrity zome
// Below is a match template for all of the variants of `DHT Ops` and entry and link types
// Holochain has already performed the following validation for you:
// - The action signature matches on the hash of its content and is signed by its author
// - The previous action exists, has a lower timestamp than the new action, and incremented sequence number
// - The previous action author is the same as the new action author
// - The timestamp of each action is after the DNA's origin time
// - AgentActivity authorities check that the agent hasn't forked their chain
// - The entry hash in the action matches the entry content
// - The entry type in the action matches the entry content
// - The entry size doesn't exceed the maximum entry size (currently 4MB)
// - Private entry types are not included in the Op content, and public entry types are
// - If the `Op` is an update or a delete, the original action exists and is a `Create` or `Update` action
// - If the `Op` is an update, the original entry exists and is of the same type as the new one
// - If the `Op` is a delete link, the original action exists and is a `CreateLink` action
// - Link tags don't exceed the maximum tag size (currently 1KB)
// - Countersigned entries include an action from each required signer
// You can read more about validation here: https://docs.rs/hdi/latest/hdi/index.html#data-validation
#[hdk_extern]
pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
    match op.flattened::<(), LinkTypes>()? {
        FlatOp::StoreEntry(store_entry) => Ok(ValidateCallbackResult::Invalid(String::from(
            "There are no entry types in this zome",
        ))),
        FlatOp::RegisterUpdate(update_entry) => Ok(ValidateCallbackResult::Invalid(String::from(
            "There are no entry types in this zome",
        ))),
        FlatOp::RegisterDelete(update_entry) => Ok(ValidateCallbackResult::Invalid(String::from(
            "There are no entry types in this zome",
        ))),
        FlatOp::RegisterCreateLink {
            link_type,
            base_address,
            target_address,
            tag,
            action,
        } => match link_type {
            LinkTypes::TagToTaggeds => {
                validate_create_link_tag_to_taggeds(action, base_address, target_address, tag)
            }
            LinkTypes::TaggedToTags => {
                validate_create_link_tagged_to_tags(action, base_address, target_address, tag)
            }
            LinkTypes::TagsPath => {
                validate_create_link_tags_path(action, base_address, target_address, tag)
            }
        },
        FlatOp::RegisterDeleteLink {
            link_type,
            base_address,
            target_address,
            tag,
            original_action,
            action,
        } => match link_type {
            LinkTypes::TagToTaggeds => validate_delete_link_tag_to_taggeds(
                action,
                original_action,
                base_address,
                target_address,
                tag,
            ),
            LinkTypes::TaggedToTags => validate_delete_link_tagged_to_tags(
                action,
                original_action,
                base_address,
                target_address,
                tag,
            ),
            LinkTypes::TagsPath => validate_delete_link_tags_path(
                action,
                original_action,
                base_address,
                target_address,
                tag,
            ),
        },
        FlatOp::StoreRecord(store_record) => {
            match store_record {
                // Complementary validation to the `StoreEntry` Op, in which the record itself is validated
                // If you want to optimize performance, you can remove the validation for an entry type here and keep it in `StoreEntry`
                // Notice that doing so will cause `must_get_valid_record` for this record to return a valid record even if the `StoreEntry` validation failed
                OpRecord::CreateEntry { .. }
                | OpRecord::UpdateEntry { .. }
                | OpRecord::DeleteEntry { .. } => Ok(ValidateCallbackResult::Invalid(
                    String::from("There are no entry types in this zome"),
                )),
                // Complementary validation to the `RegisterCreateLink` Op, in which the record itself is validated
                // If you want to optimize performance, you can remove the validation for an entry type here and keep it in `RegisterCreateLink`
                // Notice that doing so will cause `must_get_valid_record` for this record to return a valid record even if the `RegisterCreateLink` validation failed
                OpRecord::CreateLink {
                    base_address,
                    target_address,
                    tag,
                    link_type,
                    action,
                } => match link_type {
                    LinkTypes::TagToTaggeds => validate_create_link_tag_to_taggeds(
                        action,
                        base_address,
                        target_address,
                        tag,
                    ),
                    LinkTypes::TaggedToTags => validate_create_link_tagged_to_tags(
                        action,
                        base_address,
                        target_address,
                        tag,
                    ),
                    LinkTypes::TagsPath => {
                        validate_create_link_tags_path(action, base_address, target_address, tag)
                    }
                },
                // Complementary validation to the `RegisterDeleteLink` Op, in which the record itself is validated
                // If you want to optimize performance, you can remove the validation for an entry type here and keep it in `RegisterDeleteLink`
                // Notice that doing so will cause `must_get_valid_record` for this record to return a valid record even if the `RegisterDeleteLink` validation failed
                OpRecord::DeleteLink {
                    original_action_hash,
                    base_address,
                    action,
                } => {
                    let record = must_get_valid_record(original_action_hash)?;
                    let create_link = match record.action() {
                        Action::CreateLink(create_link) => create_link.clone(),
                        _ => {
                            return Ok(ValidateCallbackResult::Invalid(
                                "The action that a DeleteLink deletes must be a CreateLink"
                                    .to_string(),
                            ));
                        }
                    };
                    let link_type = match LinkTypes::from_type(
                        create_link.zome_index,
                        create_link.link_type,
                    )? {
                        Some(lt) => lt,
                        None => {
                            return Ok(ValidateCallbackResult::Valid);
                        }
                    };
                    match link_type {
                        LinkTypes::TagToTaggeds => validate_delete_link_tag_to_taggeds(
                            action,
                            create_link.clone(),
                            base_address,
                            create_link.target_address,
                            create_link.tag,
                        ),
                        LinkTypes::TaggedToTags => validate_delete_link_tagged_to_tags(
                            action,
                            create_link.clone(),
                            base_address,
                            create_link.target_address,
                            create_link.tag,
                        ),
                        LinkTypes::TagsPath => validate_delete_link_tags_path(
                            action,
                            create_link.clone(),
                            base_address,
                            create_link.target_address,
                            create_link.tag,
                        ),
                    }
                }
                OpRecord::CreatePrivateEntry { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::UpdatePrivateEntry { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::CreateCapClaim { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::CreateCapGrant { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::UpdateCapClaim { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::UpdateCapGrant { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::Dna { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::OpenChain { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::CloseChain { .. } => Ok(ValidateCallbackResult::Valid),
                OpRecord::InitZomesComplete { .. } => Ok(ValidateCallbackResult::Valid),
                _ => Ok(ValidateCallbackResult::Valid),
            }
        }
        FlatOp::RegisterAgentActivity(agent_activity) => match agent_activity {
            OpActivity::CreateAgent { agent, action } => {
                let previous_action = must_get_action(action.prev_action)?;
                match previous_action.action() {
                        Action::AgentValidationPkg(
                            AgentValidationPkg { membrane_proof, .. },
                        ) => validate_agent_joining(agent, membrane_proof),
                        _ => {
                            Ok(
                                ValidateCallbackResult::Invalid(
                                    "The previous action for a `CreateAgent` action must be an `AgentValidationPkg`"
                                        .to_string(),
                                ),
                            )
                        }
                    }
            }
            _ => Ok(ValidateCallbackResult::Valid),
        },
    }
}
