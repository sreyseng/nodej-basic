module.exports = (req, res) => {
  const { requestContext } = req.apiGateway.event;

  const errorMessage = {
    statusCode: 404,
    error: 'Invalid resource path.'
  };

  if (requestContext) {
    errorMessage.error = `${requestContext.httpMethod} ${requestContext.resourcePath} is not a valid resource path.`;
  }

  res.status(404).send(errorMessage);
};
