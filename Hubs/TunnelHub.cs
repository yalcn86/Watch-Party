using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace WhatchParty.Hubs;

public class TunnelHub : Hub
{
    // 1. PROTOKOL: Kullanıcı odaya girdiğinde onu odanın grubuna mühürler
    public async Task JoinTunnel(string roomCode)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode.ToUpper());
    }

    // 2. PROTOKOL: Anlık Mesajlaşma Sinyali
    public async Task SendMessage(string roomCode, string user, string message)
    {
        await Clients.Group(roomCode.ToUpper()).SendAsync("ReceiveMessage", user, message);
    }

    // 3. PROTOKOL: Video Kontrol Sinyali (Oynat/Durdur/Süre)
    public async Task SendVideoAction(string roomCode, string action, double time)
    {
        await Clients.OthersInGroup(roomCode.ToUpper()).SendAsync("ReceiveVideoAction", action, time);
    }

    // 4. PROTOKOL: Akıllı Link Dağıtıcı (Hibrit Medya Protokolü)
    public async Task SendVideoUrl(string roomCode, object mediaData)
    {
        // Ön yüzden gelen mediaData nesnesini (type ve payload) odadaki HERKESE anlık fırlatır
        await Clients.Group(roomCode.ToUpper()).SendAsync("ReceiveVideoUrl", mediaData);
    }
}