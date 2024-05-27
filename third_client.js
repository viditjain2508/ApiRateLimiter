const axios = require("axios");

const serverIP = "192.168.100.102";
const port = 3000;

const makeRequests = async (k) => {
  for (let i = k; i < k + 20; i++) {
    try {
      const response = await axios.post(`http://192.168.100.102:3000/api`, {
        input: i,
      });
      console.log(response.data);
    } catch (error) {
      console.error(error.response.data);
    }
  }
};

makeRequests(0);
//checking after 62 seconds whether we will be able to request again or not after 1 minute of penalty
// took 2 seconds of margin as makeRequest function is asynchronous and while running that code the below timeout function will run together
setTimeout(() => {
  makeRequests(20);
}, 62000);
