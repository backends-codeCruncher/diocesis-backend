export const documentFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  const fileExtension = file.mimetype.split('/').at(1);
  const validDocumentExtensions = ['pdf', 'docx'];

  if (validDocumentExtensions.includes(fileExtension))
    return callback(null, true);

  callback(
    new Error(`
      File extension is not valid: ${fileExtension}.
      Valid extensions ${validDocumentExtensions}`),
    false,
  );
};
