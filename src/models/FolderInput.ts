// One of a user-supplied existing folder link or a create-new signal — never both, never neither.
interface FolderInput {
  link?: string;
  createNew?: boolean;
}

export default FolderInput;
