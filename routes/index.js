var router = require("express").Router();

router.use("/", require("./visitor"));
router.use("/", require("./trainer"));
router.use("/", require("./manager"));
router.use("/", require("./reviews"));
router.use("/", require("./login"));
router.use("/admin", require("./admin_router"));

router.get("/", (req, res) => {
  res.json({ success: true });
});

module.exports = router;
