export const videoFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  const fileExtension = file.mimetype.split('/').at(1);
  const validVideoExtensions = ['mp4'];

  if (validVideoExtensions.includes(fileExtension)) return callback(null, true);

  callback(
    new Error(`
      File extension is not valid: ${fileExtension}.
      Valid extensions ${validVideoExtensions}`),
    false,
  );
};
