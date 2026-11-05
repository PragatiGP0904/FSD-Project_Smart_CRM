const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body ?? {},
    query: req.query ?? {},
    params: req.params ?? {},
  });

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => issue.message)
      .filter((value, index, list) => list.indexOf(value) === index)
      .join('. ');
    return res.status(400).json({ success: false, message });
  }

  req.body = result.data.body;
  req.validated = result.data;
  return next();
};

module.exports = validate;
