import mongoose from "mongoose";

const UserdataSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    },
    githubdata: {
        type: String, 
    }, 
    resumedata: { 
        type : String,
    }
});
const UserdataModel = mongoose.model("Userdata", UserdataSchema);

export default UserdataModel;
