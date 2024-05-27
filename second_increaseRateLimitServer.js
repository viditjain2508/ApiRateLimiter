const net = require('net');

class RateLimitedAPIServer {
  constructor(maxCallsPerMinute) {
    this.cnt = 0;
    this.maxCallsPerMinute = maxCallsPerMinute;
    this.apiRequestQueue = [];
    this.countRequestSentInAMin = 0;

    setInterval(() => {
      this.processQueue();
    }, 100);

    this.server = net.createServer((socket) => {
      socket.on('data', async (data) => {
        const input = data.toString();
        this.addApiRequest(input, socket);
      });
    });

    this.server.listen(8080, '0.0.0.0', () => {
      console.log('Server is listening on port 8080');
    });
  }

  addApiRequest(input, socket) {
    this.apiRequestQueue.push({ input, socket });
  }

  async processQueue() {
    if (
      this.apiRequestQueue.length > 0 &&
      this.countRequestSentInAMin < this.maxCallsPerMinute
    ) {
      this.countRequestSentInAMin += 1;

      const { input, socket } = this.apiRequestQueue.shift();
      const result = await this.call_me(input);

      socket.write(result);

      setTimeout(() => {
        this.countRequestSentInAMin -= 1;
      }, 60000);
    }
  }

  async call_me(input) {
    return new Promise((resolve) => {
      console.log(`Calling API from Server with input : ${input}`);
      resolve(`Server Processed the input : ${input}`);
    });
  }
}

const apiServer = new RateLimitedAPIServer(15);