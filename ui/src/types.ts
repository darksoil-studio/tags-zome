import {
  ActionHash,
  AgentPubKey,
  Create,
  CreateLink,
  Delete,
  DeleteLink,
  DnaHash,
  EntryHash,
  Record,
  SignedActionHashed,
  Update,
} from "@holochain/client";
import { ActionCommittedSignal } from "@tnesh-stack/utils";

export type TagsSignal = ActionCommittedSignal<EntryTypes, LinkTypes>;

export type EntryTypes = { type: "Tag" } & Tag;

export type LinkTypes = string;

export interface Tag {
  name: string;
}
