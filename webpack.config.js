const path = require("path");

module.exports = {
  entry: {
    main: "./src/public/main.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "./[name].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
    ],
  },
};
