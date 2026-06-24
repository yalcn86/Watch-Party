using System.ComponentModel.DataAnnotations;

namespace WhatchParty.Models;

public class Room
{
    [Key]
    public int Id { get; set; }

    public string RoomCode { get; set; } = string.Empty;

    public string CurrentVideoUrl { get; set; } = string.Empty;

    // SİBER MODİFİKASYON: Yeni eklediğimiz oda adı ve şifre alanları
    public string? RoomName { get; set; }
    
    public string? RoomPassword { get; set; }
}