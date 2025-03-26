use hdk::prelude::*;
use tags_integrity::*;

use crate::utils::create_link_relaxed;

fn all_tags_path() -> ExternResult<TypedPath> {
    Path::from(format!("tags")).typed(LinkTypes::TagsPath)
}

fn tag_path(tag: String) -> ExternResult<TypedPath> {
    Path::from(format!("tags.{tag}")).typed(LinkTypes::TagsPath)
}

#[hdk_extern]
pub fn tag_path_hash(tag: String) -> ExternResult<EntryHash> {
    tag_path(tag)?.path_entry_hash()
}

#[hdk_extern]
pub fn get_all_tags() -> ExternResult<Vec<Link>> {
    let path = all_tags_path()?;
    get_links(GetLinksInputBuilder::try_new(path.path_entry_hash()?, LinkTypes::TagsPath)?.build())
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AddTagInput {
    tag: String,
    hash: AnyDhtHash,
}

#[hdk_extern]
pub fn add_tag(input: AddTagInput) -> ExternResult<()> {
    let path = tag_path(input.tag.clone())?;
    create_link_relaxed(
        input.hash.clone(),
        path.path_entry_hash()?,
        LinkTypes::TaggedToTags,
        input.tag.clone(),
    )?;
    create_link_relaxed(
        path.path_entry_hash()?,
        input.hash,
        LinkTypes::TagToTaggeds,
        input.tag.clone(),
    )?;
    Ok(())
}

#[hdk_extern]
pub fn get_tags_for_tagged(hash: AnyDhtHash) -> ExternResult<Vec<Link>> {
    get_links(GetLinksInputBuilder::try_new(hash, LinkTypes::TaggedToTags)?.build())
}

#[hdk_extern]
pub fn get_taggeds_for_tag(tag: String) -> ExternResult<Vec<Link>> {
    let path = tag_path(tag)?;
    get_links(
        GetLinksInputBuilder::try_new(path.path_entry_hash()?, LinkTypes::TagToTaggeds)?.build(),
    )
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RemoveTag {
    pub tag: String,
    pub hash: AnyDhtHash,
}

#[hdk_extern]
pub fn remove_tag(input: RemoveTag) -> ExternResult<()> {
    let path = tag_path(input.tag.clone())?;
    let links = get_links(
        GetLinksInputBuilder::try_new(path.path_entry_hash()?.clone(), LinkTypes::TagToTaggeds)?
            .build(),
    )?;
    for link in links {
        if link.target.clone().into_hash() == input.hash.clone().into_hash().into() {
            delete_link(link.create_link_hash)?;
        }
    }
    let links = get_links(
        GetLinksInputBuilder::try_new(input.hash.clone(), LinkTypes::TaggedToTags)?.build(),
    )?;
    for link in links {
        if link
            .target
            .clone()
            .into_entry_hash()
            .ok_or(wasm_error!(WasmErrorInner::Guest(
                "No entry hash associated with link".to_string()
            )))?
            == path.path_entry_hash()?.clone().into()
        {
            delete_link(link.create_link_hash)?;
        }
    }
    Ok(())
}
