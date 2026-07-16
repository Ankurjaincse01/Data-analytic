let activeCount = 0;

const initSocket = (io) => {
  io.on("connection", (socket) => {
    activeCount++;
    io.emit("activeUsers", activeCount);
    console.log(`User connected. Active: ${activeCount}`);

    socket.on("disconnect", () => {
      activeCount = Math.max(0, activeCount - 1);
      io.emit("activeUsers", activeCount);
      console.log(`User disconnected. Active: ${activeCount}`);
    });
  });
};

module.exports = initSocket;
