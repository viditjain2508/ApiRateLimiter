const net = require('net');

class RateLimitedAPI {
  constructor(maxCallsPerMinute) {
    this.cnt = 0;
    this.maxCallsPerMinute = maxCallsPerMinute;
    this.apiRequestQueue = [];
    this.countRequestSentInAMin = 0;
    this.countRequestSentToServer = 0;
    this.client = new net.Socket();

    this.connectToServer();

    this.client.on('data', (data) => {
      console.log(data.toString());
    });

    this.client.on('error', (err) => {
      console.error(`Connection error: ${err.message}`);
      this.client.close();
    //   this.reconnectToServer();
    });

    this.client.on('close', () => {
      console.log('Connection closed');
        this.reconnectToServer();
    });

    setInterval(() => {
      this.processQueue();
    }, 100);
  }

  connectToServer() {
    this.client.connect(8080, '192.168.100.102', () => {
      console.log('Connected to server');
    });
  }

  reconnectToServer() {
    setTimeout(() => {
      console.log('Attempting to reconnect to server...');
      this.connectToServer();
    }, 5000);
  }

  addApiRequest(input) {
    this.apiRequestQueue.push(input);
  }

  async processQueue() {
    if (this.apiRequestQueue.length > 0) {
      if (this.countRequestSentInAMin < this.maxCallsPerMinute) {
        this.countRequestSentInAMin += 1;

        const input = this.apiRequestQueue.shift();
        const result = await this.call_me(input);

        console.log(result);

        setTimeout(() => {
          this.countRequestSentInAMin -= 1;
        }, 60000);
      } else if(this.client.readyState === 'open' && this.countRequestSentToServer < this.maxCallsPerMinute){

          const input = this.apiRequestQueue.shift();
          this.countRequestSentToServer++;
          this.client.write(input);
          console.log(`Sent to server : ${input}`);
          setTimeout(() => {
            this.countRequestSentToServer -= 1;
          }, 60000);
          if(this.countRequestSentToServer == this.maxCallsPerMinute){
            console.log("Wait for sometime, you have crossed the limit now!");
          }
      }
    }
  }

  async call_me(input) {
    return new Promise((resolve) => {
      console.log(`Calling API from Client with input : ${input}`);
      resolve(`Client Processed the input: ${input}`);
    });
  }
}

const apiHandler = new RateLimitedAPI(15);

for (let i = 0; i < 35; i++) {
  apiHandler.addApiRequest(`${i}`);
}