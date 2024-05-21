const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(express.static("public"));

//orders.json
function create(file_path, res, req) {
  const formData = req.body;
  if (formData) {
    fs.readFile(`public/${file_path}`, "utf-8", (err, data) => {
      if (err) {
        console.error("Error reading JSON file:", err);
        return res.status(500).send("Error processing form data");
      }

      const orders = data ? JSON.parse(data) : [];

      let maxOrderNumber = 0;
      for (const order of orders) {
        const orderNumber = parseInt(
          order["order-number"]
            ? order["order-number"]
            : order["payment-number"]
        );
        if (orderNumber > maxOrderNumber) {
          maxOrderNumber = orderNumber;
        }
      }
      file_path === "orders.json"
        ? (formData["order-number"] = maxOrderNumber + 1)
        : (formData["payment-number"] = maxOrderNumber + 1);

      orders.push(formData);

      fs.writeFile(
        `public/${file_path}`,
        JSON.stringify(orders, null, 2),
        (err) => {
          if (err) {
            console.error("Error writing to JSON file:", err);
            return res.status(500).send("Error processing form data");
          }
          console.log("Form data written to JSON file successfully");
          res.redirect("./biblomaniaSystem.html");
        }
      );
    });
  } else {
    res.redirect("/");
  }
}

////////////////// Handle create requests //////////////////
// Handle orders form submissions
app.post("/submit-form", (req, res) => {
  create("orders.json", res, req);
});
// Handle payment form submissions
app.post("/payment", (req, res) => {
  console.log("hello");
  create("payments.json", res, req);
});

////////////////// Handle update requests //////////////////
function update(edited_section, req, res) {
  const orderId = parseInt(req.params.id);
  console.log(orderId);

  fs.readFile(`public/${edited_section}.json`, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return res.status(500).send("Error processing form data");
    }

    let orders = JSON.parse(data);
    const orderIndex = orderId;

    if (orderIndex !== -1) {
      orders[orderIndex] = { ...orders[orderIndex], ...req.body };

      fs.writeFile(
        `public/${edited_section}.json`,
        JSON.stringify(orders, null, 2),
        (err) => {
          if (err) {
            console.error("Error writing to JSON file:", err);
            return res.status(500).send("Error updating order data");
          }
          res.status(200).send("Order updated successfully");
        }
      );
    } else {
      res.status(404).send("Order not found");
    }
  });
}
app.put("/edit-order/:id", (req, res) => {
  update("orders", req, res);
});
app.put("/edit-payment/:id", (req, res) => {
  update("payments", req, res);
});

// Handle deleting orders
function delete_element(deleted_section, orderId, req, res) {
  fs.readFile(`public/${deleted_section}.json`, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return res.status(500).send("Error processing form data");
    }

    const orders = JSON.parse(data);

    const updatedOrders = orders.filter(
      deleted_section === "orders"
        ? (order) => order["order-number"] !== orders[orderId]["order-number"]
        : (order) =>
            order["payment-number"] !== orders[orderId]["payment-number"]
    );
    const orderIndex = orderId;

    if (updatedOrders.length === orders.length) {
      console.log("hereeeeeeee");
      return res.status(404).send("Order not found");
    }

    fs.writeFile(
      `public/${deleted_section}.json`,
      JSON.stringify(updatedOrders, null, 2),
      (err) => {
        if (err) {
          console.error("Error writing to JSON file:", err);
          return res.status(500).send("Error processing form data");
        }
        res.status(200).send("Order deleted successfully");
      }
    );
  });
}
app.delete("/delete-order/:id", (req, res) => {
  const orderId = parseInt(req.params.id);
  delete_element("orders", orderId, req, res);
});

app.delete("/delete-payment/:id", (req, res) => {
  const orderId = parseInt(req.params.id);
  delete_element("payments", orderId, req, res);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/system", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "biblomaniaSystem.html"));
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
