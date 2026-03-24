const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const params = new URLSearchParams({
  ApiKey: "TVRjMk9UaGZPRFU0WHpFM05qazRYdz09",
  ApiPassword: "pl45J7xLg1",
  CampaignID: "22617",
  FirstName: "Test",
  LastName: "User",
  Email: "testuser@example.com",
  PhoneNumber: "+2349063106069",
  Language: "en",
  Page: "test",
});

fetch("https://tracker.edgecastmarketing.org/repost.php?act=register", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: params.toString(),
})
  .then((res) => res.json())
  .then(console.log)
  .catch(console.error);
