import axios from "axios";

export const runCode = async (language, code, setLogs) => {
  try {
    const response = await axios.post("http://localhost:5000/run", {
      language,
      code,
    });
    setLogs(response.data.output);
  } catch (error) {
    setLogs(error.response ? error.response.data.error : "An error occurred");
  }
};
