self.onmessage = (event) => {
    self.compute();
};

self.compute = () => {
    setTimeout(() => {
        self.postMessage({
            hours: 45.5
        });
    }, 10000);
};
