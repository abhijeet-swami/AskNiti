import Session from "../models/session.model.js";

const setMetaData = async (sessionId, metadata) => {
  const session = await Session.findById(sessionId);

  session.stage1Report.metadata = {
    age: metadata.age,
    gender: metadata.gender,
    caste: metadata.caste,
  };
  session.layer = 3;
  await session.save();
};

export default setMetaData;
