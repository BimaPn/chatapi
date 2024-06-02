import session from "express-session";

const sessionMiddleware = session({
  secret: "90dhdhuSDBjbdughyt7f0sdjkaj893/.,.IISfjdghfbhuf./frwgriwhj??kfhsdghoh348$u8dnsjaUhd",
  resave: true,
  saveUninitialized: true,
});

export default sessionMiddleware;
