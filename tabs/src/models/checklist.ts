import { Timestamp } from "firebase/firestore";

export interface CheckList {

    id?: string;
    name?: string;
    items?: CheckListItem[];
    timestamp?: Timestamp;
    selectedUsers?: any[];
    selectedTeams?: any[];

}

export interface CheckListItem {

    id?: string;
    text?: string;
    checklistItemId?: string;

}

export interface ChecklistUser {
    id?: string;
    userId?: string;
    checkedItems?: any[];
    date: string;
    timestamp?: Timestamp;
    checklistId?: string;
}