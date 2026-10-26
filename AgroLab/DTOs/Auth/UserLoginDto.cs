using System.Text.Json.Serialization;

public class UserLoginDto
{
    [JsonPropertyName("login")]
    public string Username { get; set; }

    public string Password { get; set; }
}
