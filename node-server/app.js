const http = require("http");
const url = require("url");

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Helper to send JSON
  const sendJSON = (status, obj) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(obj));
  };

  // Only POST allowed
  if (req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      let num1, num2;

      // First try parsing JSON body
      if (body) {
        try {
          const jsonData = JSON.parse(body);
          num1 = jsonData.num1;
          num2 = jsonData.num2;
        } catch (e) {
          return sendJSON(400, { error: "Invalid JSON" });
        }
      }

      // If query params provided, override JSON body
      if (reqUrl.query.num1 && reqUrl.query.num2) {
        num1 = parseFloat(reqUrl.query.num1);
        num2 = parseFloat(reqUrl.query.num2);
      }

      // Validate inputs
      if (
        typeof num1 !== "number" ||
        typeof num2 !== "number" ||
        isNaN(num1) ||
        isNaN(num2)
      ) {
        return sendJSON(400, { error: "Please provide valid num1 and num2" });
      }

      let opt;
      let expression;
      let result;

      if (reqUrl.pathname === "/api/add") {
        opt = "add";
        expression = `${num1} + ${num2}`;
      } else if (reqUrl.pathname === "/api/subtract") {
        opt = "subtract";
        expression = `${num1} - ${num2}`;
      } else if (reqUrl.pathname === "/api/multiply") {
        opt = "multiply";
        expression = `${num1} * ${num2}`;
      } else if (reqUrl.pathname === "/api/divide") {
        opt = "divide";
        if (num2 === 0) {
          return sendJSON(400, { opt, num1, num2, error: "Divided by zero!" });
        }
        expression = `${num1} / ${num2}`;
      } else {
        return sendJSON(404, { error: "Not Found" });
      }

      // Perform calculation using eval
      try {
        result = eval(expression);
      } catch (e) {
        return sendJSON(500, { error: "Error evaluating expression" });
      }

      sendJSON(200, { opt, num1, num2, result });
    });
  } else {
    sendJSON(405, { error: "Only POST method is allowed" });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
