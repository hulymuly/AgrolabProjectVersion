using DocumentFormat.OpenXml.Packaging;

namespace AgroLab.Services
{
    public static class ProtocolGeneratorService
    {
        public static MemoryStream GenerateFilledProtocol(string templatePath, Dictionary<string, string?> replacements)
        {
            var memoryStream = new MemoryStream();
            using (var fileStream = File.OpenRead(templatePath))
            {
                fileStream.CopyTo(memoryStream);
            }
            memoryStream.Position = 0;

            using (var wordDoc = WordprocessingDocument.Open(memoryStream, true))
            {
                var docText = string.Empty;
                using (var reader = new StreamReader(wordDoc.MainDocumentPart.GetStream()))
                {
                    docText = reader.ReadToEnd();
                }

                foreach (var pair in replacements)
                {
                    var placeholder = "{" + pair.Key + "}";
                    docText = docText.Replace(placeholder, pair.Value ?? "");
                }

                using (var writer = new StreamWriter(wordDoc.MainDocumentPart.GetStream(FileMode.Create)))
                {
                    writer.Write(docText);
                }
            }

            memoryStream.Position = 0;
            return memoryStream;
        }
    }
}