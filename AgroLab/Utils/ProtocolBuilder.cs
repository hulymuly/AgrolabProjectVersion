// ProtocolBuilder.cs
using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using AgroLab.Entities;
using AgroLab.DTOs.Samples;

namespace AgroLab.Utils
{
    /// <summary>
    /// Builds protocol documents by populating templates in the Templates folder.
    /// Selects template based on sample type (seeds or potatoes).
    /// </summary>
    public static class ProtocolBuilder
    {
        private const string TemplatesPath = "Templates";
        private const string SeedsTemplate = "protocol-seeds-template.docx";
        private const string PotatoesTemplate = "protocol-potatoes-template.docx";

        /// <summary>
        /// Generates a protocol DOCX for the sample with given ID.
        /// Returns byte[] or null if sample not found.
        /// </summary>
        public static byte[] BuildProtocol(AgroLabDbContext context, AutoMapper.IMapper mapper, int id)
        {
            // Seeds
            if (context.Seeds.Any(s => s.Id == id))
            {
                var seed = context.Seeds
                    .Where(s => s.Id == id)
                    .Select(s => new
                    {
                        s.SampleCode,
                        CustomerName = s.Customer.Name,
                        s.DateContract,
                        Analyses = s.SeedAnalyses
                            .Select(a => new SampleAnalysisDto
                            {
                                NormId = a.NormId.GetValueOrDefault(),
                                NormName = a.Norm.Analysis,
                                AcceptValue = a.Norm.AcceptValue,
                                Value = a.Value
                            })
                            .ToList()
                    })
                    .FirstOrDefault();
                if (seed == null) return null;

                return GenerateDocument(SeedsTemplate, doc =>
                {
                    ReplacePlaceholder(doc, "{SampleCode}", seed.SampleCode);
                    ReplacePlaceholder(doc, "{Customer}", seed.CustomerName);
                    ReplacePlaceholder(doc, "{ContractDate}", seed.DateContract?.ToString("dd.MM.yyyy"));
                    FillAnalysisTable(doc, seed.Analyses);
                });
            }

            // Potatoes
            if (context.Potatoes.Any(p => p.Id == id))
            {
                var potato = context.Potatoes
                    .Where(p => p.Id == id)
                    .Select(p => new
                    {
                        p.SampleCode,
                        CustomerName = p.Customer.Name,
                        p.DateContract,
                        Analyses = p.PotatoAnalyses
                            .Select(a => new SampleAnalysisDto
                            {
                                NormId = a.NormId.GetValueOrDefault(),
                                NormName = a.Norm.Analysis,
                                AcceptValue = a.Norm.AcceptValue,
                                Value = a.Value
                            })
                            .ToList()
                    })
                    .FirstOrDefault();
                if (potato == null) return null;

                return GenerateDocument(PotatoesTemplate, doc =>
                {
                    ReplacePlaceholder(doc, "{SampleCode}", potato.SampleCode);
                    ReplacePlaceholder(doc, "{Customer}", potato.CustomerName);
                    ReplacePlaceholder(doc, "{ContractDate}", potato.DateContract?.ToString("dd.MM.yyyy"));
                    FillAnalysisTable(doc, potato.Analyses);
                });
            }

            return null;
        }

        private static byte[] GenerateDocument(string templateFileName, Action<WordprocessingDocument> populate)
        {
            var templatePath = Path.Combine(AppContext.BaseDirectory, TemplatesPath, templateFileName);
            using var templateStream = File.OpenRead(templatePath);
            using var ms = new MemoryStream();
            templateStream.CopyTo(ms);
            using var wordDoc = WordprocessingDocument.Open(ms, true);
            populate(wordDoc);
            wordDoc.MainDocumentPart.Document.Save();
            return ms.ToArray();
        }

        private static void ReplacePlaceholder(WordprocessingDocument doc, string placeholder, string text)
        {
            if (string.IsNullOrEmpty(text)) return;
            var body = doc.MainDocumentPart.Document.Body;
            foreach (var t in body.Descendants<Text>())
            {
                if (t.Text.Contains(placeholder))
                {
                    t.Text = t.Text.Replace(placeholder, text);
                }
            }
        }

        private static void FillAnalysisTable(WordprocessingDocument doc, List<SampleAnalysisDto> analyses)
        {
            var tables = doc.MainDocumentPart.Document.Body.Elements<Table>().ToList();
            if (!tables.Any()) return;
            var table = tables.Last();

            // Template row
            var templateRow = table.Elements<TableRow>().Last();
            foreach (var entry in analyses)
            {
                var newRow = (TableRow)templateRow.CloneNode(true);
                var cells = newRow.Elements<TableCell>().ToArray();
                if (cells.Length >= 3)
                {
                    cells[0].Elements<Paragraph>().First().Elements<Run>().First().Elements<Text>().First().Text = entry.NormName;
                    cells[1].Elements<Paragraph>().First().Elements<Run>().First().Elements<Text>().First().Text = entry.Value ?? string.Empty;
                    cells[2].Elements<Paragraph>().First().Elements<Run>().First().Elements<Text>().First().Text = entry.AcceptValue ?? string.Empty;
                }
                table.AppendChild(newRow);
            }
            templateRow.Remove();
        }
    }
}
