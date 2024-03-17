import LibraryAdd from "../assets/library_add.svg?react";
import "./CollectionButton.css";

export function CollectionButton() {
  return (
    <button type="button" className="CollectionButton">
      <LibraryAdd />
    </button>
  );
}
