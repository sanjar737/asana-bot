import asana from "asana";

const token = "1/1201119039003323:a60d264ffd1eed53c353330045ab25dc";
const client = asana.Client.create().useAccessToken(token);

export default client;
