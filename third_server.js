const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

const rateLimit = (() => {
  const maxCallsPerMinute = 15;
  const penaltyTime = 60000; // 1 minute
  const clients = new Map();

  return (req, res, next) => {
    const clientIP = req.ip;
    const currentTime = Date.now();

    if (!clients.has(clientIP)) {
      console.log(`Client with IP : ${clientIP} made their first request`);
      clients.set(clientIP, { count: 0, penaltyEndTime: 0 });
    }

    const clientData = clients.get(clientIP);

    if (clientData.penaltyEndTime > currentTime) {
      return res.status(429).send("Too many requests. Please try again later.");
    }

    if (clientData.count < maxCallsPerMinute) {
      clientData.count++;

      setTimeout(() => {
        clientData.count--;
      }, 60000);
      
      clients.set(clientIP, clientData);
      next();
      
    } else {
      clientData.penaltyEndTime = currentTime + penaltyTime;
      clients.set(clientIP, clientData);
      res.status(429).send("Too many requests. Please try again in 1 minute.");
    }
  };
})();

app.post("/api", rateLimit, (req, res) => {
  res.send(`Processed input: ${req.body.input}`);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
});
