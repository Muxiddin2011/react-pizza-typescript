const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4000;
const DB_PATH = path.join(__dirname, "db.json");

function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return { pizzas: [], orders: [] };
  }
}
function saveDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}
function nextId(items = []) {
  return items.length
    ? Math.max(...items.map((x) => Number(x.id) || 0)) + 1
    : 1;
}
function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("JSON noto‘g‘ri"));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const db = readDb();
  try {
    if (req.method === "GET" && url.pathname === "/health")
      return send(res, 200, { ok: true });
    if (req.method === "GET" && url.pathname === "/pizzas") {
      let pizzas = Array.isArray(db.pizzas) ? [...db.pizzas] : [];
      const category = url.searchParams.get("category");
      const sortBy = url.searchParams.get("sortBy");
      const order = url.searchParams.get("order");
      if (category !== null && category !== "")
        pizzas = pizzas.filter((p) => Number(p.category) === Number(category));
      if (["rating", "price", "title"].includes(sortBy))
        pizzas.sort((a, b) => {
          const r =
            typeof a[sortBy] === "string"
              ? String(a[sortBy]).localeCompare(String(b[sortBy]), "ru")
              : Number(a[sortBy]) - Number(b[sortBy]);
          return order === "desc" ? -r : r;
        });
      return send(res, 200, pizzas);
    }
    if (req.method === "POST" && url.pathname === "/pizzas") {
      const b = await readBody(req);
      if (!String(b.title || "").trim() || Number(b.price) <= 0)
        return send(res, 400, { error: "Nomi va to‘g‘ri narx kerak." });
      const pizza = {
        id: nextId(db.pizzas),
        title: String(b.title).trim(),
        imageUrl: b.imageUrl || "",
        price: Number(b.price),
        category: Number(b.category || 0),
        rating: Number(b.rating || 0),
        types:
          Array.isArray(b.types) && b.types.length ? b.types.map(Number) : [0],
        sizes:
          Array.isArray(b.sizes) && b.sizes.length ? b.sizes.map(Number) : [26],
      };
      db.pizzas.push(pizza);
      saveDb(db);
      return send(res, 201, pizza);
    }
    const pizzaMatch = url.pathname.match(/^\/pizzas\/(\d+)$/);
    if (pizzaMatch && req.method === "PUT") {
      const id = Number(pizzaMatch[1]);
      const index = db.pizzas.findIndex((p) => Number(p.id) === id);
      if (index < 0) return send(res, 404, { error: "Pizza topilmadi." });
      const b = await readBody(req);
      db.pizzas[index] = {
        ...db.pizzas[index],
        ...b,
        id,
        price: Number(b.price),
        category: Number(b.category),
        rating: Number(b.rating),
      };
      saveDb(db);
      return send(res, 200, db.pizzas[index]);
    }
    if (pizzaMatch && req.method === "DELETE") {
      const id = Number(pizzaMatch[1]);
      const old = db.pizzas.length;
      db.pizzas = db.pizzas.filter((p) => Number(p.id) !== id);
      if (db.pizzas.length === old)
        return send(res, 404, { error: "Pizza topilmadi." });
      saveDb(db);
      return send(res, 200, { ok: true });
    }
    if (req.method === "GET" && url.pathname === "/orders")
      return send(res, 200, db.orders || []);
    if (req.method === "POST" && url.pathname === "/orders") {
      const b = await readBody(req);
      if (
        !String(b.name || "").trim() ||
        !String(b.address || "").trim() ||
        !String(b.phone || "").trim() ||
        !Array.isArray(b.products) ||
        !b.products.length
      )
        return send(res, 400, {
          error: "Ism, manzil, telefon va mahsulotlar kerak.",
        });
      const order = {
        id: nextId(db.orders),
        name: String(b.name).trim(),
        address: String(b.address).trim(),
        phone: String(b.phone).trim(),
        products: b.products,
        totalPrice: Number(b.totalPrice || 0),
        delivered: false,
        createdAt: new Date().toISOString(),
      };
      db.orders.unshift(order);
      saveDb(db);
      return send(res, 201, order);
    }
    const orderMatch = url.pathname.match(/^\/orders\/(\d+)\/delivered$/);
    if (orderMatch && req.method === "PATCH") {
      const id = Number(orderMatch[1]);
      const order = (db.orders || []).find((o) => Number(o.id) === id);
      if (!order) return send(res, 404, { error: "Buyurtma topilmadi." });
      const b = await readBody(req);
      order.delivered = Boolean(b.delivered);
      saveDb(db);
      return send(res, 200, order);
    }
    return send(res, 404, { error: "Route topilmadi." });
  } catch (error) {
    console.error(error);
    return send(res, 500, { error: error.message || "Server xatosi." });
  }
});

server.listen(PORT, () =>
  console.log(`Backend ishga tushdi: http://localhost:${PORT}`),
);
