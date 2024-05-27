class RateLimitedAPI_fixedInterval {
    constructor(maxCallsPerMinute) {
      this.maxCallsPerMinute = maxCallsPerMinute;
      this.apiRequestQueue = [];
      this.startInterval();
    }

    startInterval() {
      setInterval(() => {
        this.processQueue();
      }, 60000 / this.maxCallsPerMinute); // Calculate interval based on the allowed rate
    }

    addApiRquest(input) {
      this.apiRequestQueue.push(input);
    }
    async processQueue() {
      if (this.apiRequestQueue.length > 0) {
        const input = this.apiRequestQueue.shift();
        const result = await this.call_me(input);
        console.log(result);
      }
    }

    async call_me(input) {
      return new Promise((resolve) => {
        console.log(`Calling API in fixedInterval for : ${input}`);
        resolve(`In fixedInterval, Processed input : ${input}`);
      });
    }
  }

  class RateLimitedAPI {
    constructor(maxCallsPerMinute) {
      this.cnt = 0;
      this.maxCallsPerMinute = maxCallsPerMinute;
      this.apiRequestQueue = [];
      this.countRequestSentInAMin = 0;

      setInterval(() => {
        this.processQueue();
      }, 100);
    }

    addApiRquest(input) {
      this.apiRequestQueue.push(input);
    }

    async processQueue() {
      if (
        this.apiRequestQueue.length > 0 &&
        this.countRequestSentInAMin < this.maxCallsPerMinute
      ) {
        this.countRequestSentInAMin = this.countRequestSentInAMin + 1;

        const input = this.apiRequestQueue.shift();
        const result = await this.call_me(input);

        console.log(result);

        setTimeout(() => {
          this.countRequestSentInAMin = this.countRequestSentInAMin - 1;
        }, 60000);
      }
    }

    async call_me(input) {
      return new Promise((resolve) => {
        console.log(`Calling API for : ${input}`);
        resolve(`Processed input : ${input}`);
      });
    }
  }

  const apiHandler_fixedInterval = new RateLimitedAPI_fixedInterval(15);
  const apiHandler = new RateLimitedAPI(15);

  for (let i = 0; i < 20; i++) {
    apiHandler_fixedInterval.addApiRquest(`${i}`);

    apiHandler.addApiRquest(`${i}`);
  }