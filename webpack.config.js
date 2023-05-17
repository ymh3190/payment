const path = require("path");

module.exports = {
  mode: process.env.NODE_ENV ? process.env.NODE_ENV : "development",
  watch: process.env.NODE_ENV ? false : true,
  entry: {
    main: "./src/public/main.ts",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "./[name].js",
    clean: true,
  },
};
