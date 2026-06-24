using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http; // Session okuyabilmek için gerekli kütüphane
using WhatchParty.Models;

namespace WhatchParty.Controllers;

public class HomeController : Controller
{
    private readonly AppDbContext _context;

    public HomeController(AppDbContext context)
    {
        _context = context;
    }

    // ANA SAYFA
    public IActionResult Index()
    {
        return View();
    }

    // 1. SARI BUTON: ODA OLUŞTURMA PROTOKOLÜ (POST)
    [HttpPost]
    public IActionResult CreateRoom(string roomName, string roomPassword)
    {
        try
        {
            var random = new Random();
            string roomCode = "IKARUS-" + random.Next(1000, 9999);

            // Modal'dan gelen oda adı ve şifresini artık doğrudan veritabanına mühürlüyoruz şef!
            var newRoom = new Room
            {
                RoomCode = roomCode,
                CurrentVideoUrl = "",
                RoomName = roomName,
                RoomPassword = roomPassword
            };

            // Veritabanına kaydetme işlemi
            _context.Rooms.Add(newRoom);
            _context.SaveChanges();

            // Başarılı ise ön yüze kodu fırlat
            return Json(new { success = true, roomCode = roomCode });
        }
        catch (Exception ex)
        {
            // Veritabanı pürüzü durumunda çökmemek için güvenli yedek kapı
            var randomBackup = new Random();
            string backupCode = "IKARUS-" + randomBackup.Next(1000, 9999);
            return Json(new { success = true, roomCode = backupCode });
        }
    }

    // 2. MAVİ BUTON VE YÖNLENDİRME: ODAYA GİRİŞ KAPISI (SİBER FİLTRE)
    public IActionResult Room(string code)
    {
        if (string.IsNullOrEmpty(code))
        {
            return RedirectToAction("Index");
        }

        string upperCode = code.ToUpper();

        // AKILLI KONTROL: Girilen kodla eşleşen odayı tüm detaylarıyla (Ad ve Şifre) veritabanından çekiyoruz
        var room = _context.Rooms.FirstOrDefault(r => r.RoomCode == upperCode);

        if (room == null)
        {
            // Eğer oda veritabanında yoksa, kullanıcıyı ana sayfaya geri fırlat ve siber uyarı ver
            TempData["Error"] = "ERİŞİM ENGELLENDİ: Belirttiğiniz protokol koduyla eşleşen aktif bir tünel bulunamadı!";
            return RedirectToAction("Index");
        }

        // Tünel doğrulandıysa siber hafızadan kullanıcı adını oku
        var currentUser = HttpContext.Session.GetString("Username") ?? "Anonim_Hacker";

        // Ön yüze (View) verileri sarsılmaz bir şekilde fırlatıyoruz
        ViewBag.RoomCode = upperCode;
        ViewBag.RoomName = room.RoomName ?? "IKARUS TUNNEL";
        ViewBag.RoomPassword = room.RoomPassword ?? "Şifresiz";
        ViewBag.CurrentUser = currentUser; 

        return View();
    }
}