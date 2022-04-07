const { User } = require("../lib/sequelize");

const router = require("express").Router();

router.get("/", async (req, res) => {
  try {
    const findUsers = await User.findAll({
      where: {
        ...req.query
      }
    });

    return res.status(200).json({
      message: "Find users",
      result: findUsers
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Server error"
    })
  }
})

router.post("/", async (req, res) => {
  try {
    await User.create(req.body);

    return res.status(200).json({
      message: "Create user",
    })
  } catch (err) {
    return res.status(500).json({
      message: "Server error"
    })
  }
})

module.exports = router;