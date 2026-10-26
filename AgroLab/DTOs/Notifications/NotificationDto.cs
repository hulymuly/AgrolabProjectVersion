namespace AgroLab.DTOs.Notifications
{
    public class NotificationDto
    {
        public string Type { get; set; } = null!;
        public string Message { get; set; } = null!;
        public DateTime? RelatedDate { get; set; }  // дата, к которой привязано уведомление (например, срок годности)
    }
}
