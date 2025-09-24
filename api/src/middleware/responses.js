export function responseMethods(_, res, next) {
  res.success = function (data = undefined) {
    return this.status(200).json({ status: "ok", data: data });
  };

  res.error = function (message) {
    return this.status(400).json({ status: "error", message });
  };

  res.unauthorized = function () {
    return this.status(401).json({ status: "unauthorized" });
  };

  res.notFound = function () {
    return this.status(404).json({ status: "not Found" });
  };

  res.conflict = function () {
    return this.status(409).json({ status: "conflict" });
  };

  res.notModified = function () {
    return this.status(304).json({status: "not modified"});
  };

  next();
}
