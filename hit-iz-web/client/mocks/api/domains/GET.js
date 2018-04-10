module.exports = function (request, response) {
  var targetFileName = 'GET.json';

  // Check is a type parameter exist
  if (request.query.type) {
    // Generate a new targetfilename with that type parameter
    targetFileName = 'GET_' + request.query.domain + '.json';

    // If file does not exist then respond with 404 header
    if (!fs.accessSync(targetFileName)) {
      return response.status(404);
    }
  }

  // Respond with targetFileName
  response.sendFile(targetFileName, {root: __dirname});
}
