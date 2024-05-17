// handle the form data
let shipped_label = document.querySelector(".shipped-label");
let not_shipped_label = document.querySelector(".not-shipped-label");
let shipped_radio = document.getElementById("shipped");
let not_shipped_radio = document.getElementById("not-shipped");
shipped_label.addEventListener("click", function () {
  if (not_shipped_radio.checked) {
    not_shipped_radio.checked = false;
  }
});
not_shipped_label.addEventListener("click", function () {
  if (shipped_radio.checked) {
    shipped_radio.checked = false;
  }
});

////////// popup helper function /////////////////////
function set_popup_data(allData, order_id) {
  let order_data = `
  <div class="info">
  <span>${
    allData[order_id]["order-number"] ? "رقم الاوردر" : "رقم العمليه"
  }</span><input type = "text" name = "order-number" value="${
    allData[order_id]["order-number"]
      ? allData[order_id]["order-number"]
      : allData[order_id]["payment-number"]
  }">
  </div>

  `;
  for (let i = 0; i < Object.keys(allData[order_id]).length; i++) {
    if (Object.keys(allData[order_id])[i] === "order-number") {
      Object.keys(allData[order_id])[i] = "رقم الاوردر";
    } else if (Object.keys(allData[order_id])[i] === "payment-number") {
      Object.keys(allData[order_id])[i] = "رقم العمليه";
    }
    if (
      Object.keys(allData[order_id])[i] !== "order-number" &&
      Object.keys(allData[order_id])[i] !== "payment-number"
    ) {
      order_data += `
      <div class="info">
        <span>${
          Object.keys(allData[order_id])[i]
        } : </span><input type="text" name="${
        Object.keys(allData[order_id])[i]
      }" value="${allData[order_id][Object.keys(allData[order_id])[i]]}">
      </div>
      
      `;
    }
  }
  return `
  <div class="popup-order-top-title">
  <p>بيبلومانيا ستور</p>
</div>
<div class="order-full-data">
<form id="popup-edit-form">
  ${order_data}
  <div class="popup-btns">
  <input type="submit" class="save hidden" value="حفظ"/>
  </div>
</form>
</div>
`;
}

////////// handling Data form the json files///////////////
function editable_inputs() {
  const popup_order_inputs = document.querySelectorAll(
    ".popup-order .order-full-data #popup-edit-form .info input"
  );
  popup_order_inputs.forEach((e) => {
    e.disabled = false;
  });
}
function disabled_inputs() {
  const popup_order_inputs = document.querySelectorAll(
    ".popup-order .order-full-data #popup-edit-form .info input"
  );
  popup_order_inputs.forEach((e) => {
    e.disabled = true;
  });
}
const popup_order = document.querySelector(".popup-order");
function handel_edits(edit_btns, edited_section, allData) {
  edit_btns.forEach((e) => {
    e.addEventListener("click", () => {
      // handle popup order data
      let edited_order_number = +e.id.match(/\d+/g)[0];
      console.log(edited_order_number);
      popup_order.innerHTML = set_popup_data(allData, edited_order_number);
      editable_inputs();
      // handle save btn
      const save_btn = document.querySelector(".popup-btns .save");
      save_btn.classList.remove("hidden");

      // // Handle form submission for saving order edits
      const edit_form = document.querySelector(".popup-order #popup-edit-form");
      console.log(edited_order_number);
      edit_form.action = `/edit-${edited_section}/${edited_order_number}`;
      edit_form.method = "put";
      edit_form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(edit_form);
        const data = Object.fromEntries(formData.entries());

        fetch(`/edit-${edited_section}/${edited_order_number}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }).then((response) => {
          if (response.ok) {
            alert("Order updated successfully");
            window.location.reload();
          } else {
            alert("Failed to update order");
          }
        });
      });
    });
  });
}

function handel_deletes(delete_btns, deleted_section) {
  delete_btns.forEach((delete_btn) => {
    delete_btn.addEventListener("click", () => {
      const order_number = delete_btn.id.match(/\d+/g)[0];

      // Sending DELETE request to server
      fetch(`/delete-${deleted_section}/${order_number}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => {
        if (response.ok) {
          alert("Order deleted successfully");
          window.location.reload();
        } else {
          alert("Failed to delete order");
        }
      });
    });
  });
}
//////////////// handling orders container ///////
let orders_container = document.querySelector(".orders");
fetch("/orders.json").then((response) => {
  let data = response.json();
  data.then((allData) => {
    for (let i = allData.length - 1; i >= 0; i--) {
      let order_sub_details = document.createElement("div");
      order_sub_details.id = `order-${allData[i]["order-number"]}`;
      order_sub_details.classList.add("order");

      order_sub_details.innerHTML = `
      <div class="order-data">
        <div class="info">
        <span>رقم الاوردر : </span><p> ${allData[i]["order-number"]}</p>
        </div>
        <div class="info">
        <span>اسم العميل : </span><p> ${allData[i]["اسم العميل"]}</p>
        </div>
        <div class="info">
        <span>تاريخ الشحن : </span><p> ${allData[i]["تاريخ الشحن"]}</p>
        </div>
      </div>
      <div class="order-control-btns">
          <label for="toggle">
          <i class='bx bx-expand control-icon show' id = "show-${i}"></i>
          </label>
        <label for="toggle">
        <i class='bx bx-edit control-icon edit' id = "edit-${i}
        }"></i>
        </label>
        <i class='bx bx-message-square-x control-icon delete' id = "delete-${i}"></i>
        <i class='bx bxs-star control-icon star ${
          allData[i]["حالة الشحن"] === "تم الشحن" ? "shipped" : ""
        }'></i>
      </div>
    `;
      orders_container.appendChild(order_sub_details);
    }
    //////////////////////////////////////////////////////////////////////////////////
    /////////// Handling edits on orders /////////
    const popup_order = document.querySelector(".popup-order");
    const edit_btns = document.querySelectorAll("label .edit");
    handel_edits(edit_btns, "order", allData);

    /////////// Handling deletes on orders /////////
    const delete_btns = document.querySelectorAll(".control-icon.delete");
    handel_deletes(delete_btns, "order");

    const show_btn = document.querySelectorAll("label .show");
    show_btn.forEach((e) => {
      e.addEventListener("click", () => {
        let showed_order_number = +e.id.match(/\d+/g)[0];
        popup_order.innerHTML = set_popup_data(allData, showed_order_number);
        disabled_inputs();
        const save_btn = document.querySelector(".popup-btns .save");
        save_btn.classList.add("hidden");
      });
    });
  });
});
/////////////////////////////////////////////////////////////////////////////////////////

//////////////// handling payments container ///////
let payments_container = document.querySelector(".payments");
fetch("./payments.json").then((response) => {
  let data = response.json();
  data.then((allData) => {
    for (let i = allData.length - 1; i >= 0; i--) {
      let payment_sub_details = document.createElement("div");
      payment_sub_details.id = `payment-${allData[i]["payment-number"]}`;
      payment_sub_details.classList.add("payment");
      payment_sub_details.innerHTML = `
    <div class="order-data">
      <div class="info">
      <span>رقم العمليه : </span><p> ${allData[i]["payment-number"]}</p>
      </div>
      <div class="info">
      <span>اسم التاجر : </span><p> ${allData[i]["اسم التاجر"]}</p>
      </div>
      <div class="info">
      <span>التاريخ : </span><p> ${allData[i]["التاريخ"]}</p>
      </div>
    </div>
    <div class="order-control-btns">
        <label for="toggle">
        <i class='bx bx-expand control-icon show-payment' id = "show-${i}"></i>
        </label>
      <label for="toggle">
      <i class='bx bx-edit control-icon edit-payment' id = "edit-${i}
      }"></i>
      </label>
      <i class='bx bx-message-square-x control-icon delete-payment' id = "delete-${i}
      }"></i>`;
      payments_container.appendChild(payment_sub_details);
    }
    /////// handle payment-show btns
    const popup_card = document.querySelector(".popup-order");
    const show_btn = document.querySelectorAll("label .show-payment");
    const edit_btns = document.querySelectorAll("label .edit-payment");
    show_btn.forEach((e) => {
      e.addEventListener("click", () => {
        let showed_payment_number = +e.id.match(/\d+/g)[0];
        popup_card.innerHTML = set_popup_data(allData, showed_payment_number);
        const popup_payment_inputs = document.querySelectorAll(
          ".popup-order .order-full-data #popup-edit-form .info input"
        );
        popup_payment_inputs.forEach((e) => {
          e.disabled = true;
        });

        const save_btn = document.querySelector(".popup-btns .save");
        save_btn.classList.add("hidden");
      });
    });

    /////////// Handling Updates on payments /////////
    const edit_payment_btns = document.querySelectorAll("label .edit-payment");
    handel_edits(edit_payment_btns, "payment", allData);

    /////////// Handling deletes on payments /////////
    const delete_btns = document.querySelectorAll(
      ".control-icon.delete-payment"
    );
    handel_deletes(delete_btns, "payment");
  });
});

function swap(orders, payments, payments_title, orders_title) {
  payments_title.addEventListener("click", () => {
    orders.classList.add("swap");
    payments.classList.remove("swap");
    orders_title.classList.remove("active");
    payments_title.classList.add("active");
  });
  orders_title.addEventListener("click", () => {
    orders.classList.remove("swap");
    payments.classList.add("swap");
    orders_title.classList.add("active");
    payments_title.classList.remove("active");
  });
}
// handle swapping the orders with the payment
let orders = document.querySelector(".orders");
let payments = document.querySelector(".payments");
let payments_title = document.querySelector(".payments-title");
let orders_title = document.querySelector(".orders-title");
swap(orders, payments, payments_title, orders_title);
// handle swapping the orders-form with the payment-form
let add_order_form = document.querySelector(".add-order");
let add_payment_form = document.querySelector(".add-payment");
let add_payments_title = document.querySelector(".add-payment-title");
let add_orders_title = document.querySelector(".add-order-title");
swap(add_order_form, add_payment_form, add_payments_title, add_orders_title);
