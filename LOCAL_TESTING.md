# 🧪 Local Testing Guide

## Проблемы и решения

### ❌ Проблема: Все рыбы показываются как inactive
**Причина:** Frontend кэш или старая версия кода  
**Решение:**
1. Остановить `npm run dev` (Ctrl+C)
2. Очистить кэш Next.js: `rm -rf .next`
3. Перезапустить: `npm run dev`
4. **Обязательно:** Hard refresh в браузере (Ctrl+Shift+R или Cmd+Shift+R)

### ❌ Проблема: Предлагает снова claim starter pack
**Причина:** Frontend читает данные из старого контракта (кэш браузера)  
**Решение:**
1. Открыть DevTools (F12)
2. Application → Storage → Clear site data
3. Или Shift+F5 (hard refresh)

---

## 🚀 Правильный процесс запуска

### 1. Убедись что используешь новые контракты V2

**Проверь `.env.local`:**
```bash
cat .env.local
```

Должно быть:
```
NEXT_PUBLIC_FRYREEF_ADDRESS=0x63C3d6AA5213286Fc24bC23D0E75109DaF1163DF
NEXT_PUBLIC_EGG_NFT_ADDRESS=0xf2170b4f6c3CC53A98b0b690F67434A724d4cB39
NEXT_PUBLIC_FISH_NFT_ADDRESS=0x7F5F33928689160487bCA1C4849a6dF8223440b1
```

### 2. Очисти кэш и билд
```bash
# Удали старый билд
rm -rf .next

# Очисти node_modules кэш (опционально, если проблемы)
rm -rf node_modules/.cache
```

### 3. Запусти dev сервер
```bash
npm run dev
```

### 4. Очисти кэш браузера
- **Chrome/Edge:** Ctrl+Shift+R (Windows) или Cmd+Shift+R (Mac)
- **Firefox:** Ctrl+F5
- Или через DevTools (F12) → Network → Disable cache

### 5. Проверь что подключился к Base Mainnet
- В wallet должно быть "Base" network
- НЕ Base Sepolia testnet!

---

## ✅ Что должно работать

### В локальной версии:
- ✅ Рыбы показывают правильную редкость (не Common для всех)
- ✅ Active fish производят dust
- ✅ Inactive fish (если > capacity) показывают amber badge
- ✅ Starter pack НЕ предлагается (уже claimed)
- ✅ Collect dust работает
- ✅ Lay egg работает
- ✅ Карточки НЕ мигают при polling (каждые 5 сек)

### Если что-то не работает:
1. Проверь консоль браузера (F12) на ошибки
2. Проверь Network tab - какие адреса контрактов используются
3. Проверь что подключён к правильной сети (Base mainnet)
4. Hard refresh (Ctrl+Shift+R)

---

## 🔍 Debug: Проверка адресов контрактов

Открой консоль браузера (F12) и выполни:
```javascript
console.log({
  fryReef: process.env.NEXT_PUBLIC_FRYREEF_ADDRESS,
  fishNFT: process.env.NEXT_PUBLIC_FISH_NFT_ADDRESS,
  eggNFT: process.env.NEXT_PUBLIC_EGG_NFT_ADDRESS,
});
```

**Должно вывести V2 адреса:**
```
{
  fryReef: "0x63C3d6AA5213286Fc24bC23D0E75109DaF1163DF",
  fishNFT: "0x7F5F33928689160487bCA1C4849a6dF8223440b1",
  eggNFT: "0xf2170b4f6c3CC53A98b0b690F67434A724d4cB39"
}
```

Если видишь другие адреса → очисти кэш и перезапусти!

---

## 📱 Тестирование в Base Mini App

1. Убедись что Vercel задеплоил последнюю версию
2. Проверь ENV variables в Vercel dashboard
3. На телефоне: Settings → Clear data для Base app
4. Перезапусти Base app

---

## 🎯 Checklist для полного теста

- [ ] Hard refresh после запуска dev сервера
- [ ] Wallet подключён к Base Mainnet (не testnet!)
- [ ] Рыбы показывают правильную редкость
- [ ] Pending dust накапливается
- [ ] Collect dust работает
- [ ] Lay egg работает (если есть dust)
- [ ] Hatch egg работает
- [ ] Expand reef работает
- [ ] Карточки не мигают при polling
- [ ] Starter pack не предлагается повторно
- [ ] Inactive fish показываются правильно (если > capacity)

---

**Всё работает?** Готов к деплою на production! 🚀
