import CollectionAPI from "./api/collection";

export default interface API {
  new(): API
  collection: CollectionAPI,
}
