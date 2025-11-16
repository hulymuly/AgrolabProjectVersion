// FileParser.cs
using System;
using System.IO;
using System.Text.RegularExpressions;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using AgroLab.DTOs.Samples;

namespace AgroLab.Utils
{
    /// <summary>
    /// Utility to extract SampleDto data only from the provided blank contract DOCX templates.
    /// Supports files named starting with "бланк дог".
    /// </summary>
    public static class FileParser
    {
        // Regex to capture between __ underlines after "Договор №"
        private static readonly Regex RgContractNumber = new Regex(@"Договор №__([^_]+)__", RegexOptions.Compiled);
        // Regex to capture customer name after 'директора _'
        private static readonly Regex RgCustomer = new Regex(@"директора _(.+?)_", RegexOptions.Compiled | RegexOptions.IgnoreCase);

        /// <summary>
        /// Parses only the provided blank contract DOCX files (fileName must contain "бланк дог").
        /// Extracts ContractNumber and Customer.
        /// </summary>
        /// <param name="stream">Stream of the DOCX file.</param>
        /// <param name="fileName">Original file name (used to filter supported templates).</param>
        /// <returns>SampleDto with Category="contract", ContractNumber, Customer, AcceptanceFile set.</returns>
        public static SampleDto ExtractSampleData(Stream stream, string fileName)
        {
            if (fileName == null || !fileName.ToLower().Contains("бланк дог"))
                throw new NotSupportedException("File not supported by this parser");

            using var doc = WordprocessingDocument.Open(stream, false);
            var body = doc.MainDocumentPart.Document.Body;
            var text = body.InnerText;

            var numMatch = RgContractNumber.Match(text);
            var custMatch = RgCustomer.Match(text);

            var dto = new SampleDto
            {
                Category = "contract",
                AcceptanceFile = fileName,
                ContractNumber = numMatch.Success ? numMatch.Groups[1].Value.Trim() : null,
                Customer = custMatch.Success ? custMatch.Groups[1].Value.Trim() : null
            };
            return dto;
        }
    }
}