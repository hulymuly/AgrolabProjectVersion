using System.Text.Json.Serialization;

public class UserRegisterDto
{
    [JsonPropertyName("login")]
    public string Username { get; set; }

    [JsonPropertyName("password")]
    public string Password { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("surname")]
    public string Surname { get; set; }

    [JsonPropertyName("role")]
    public string Role { get; set; }
}
