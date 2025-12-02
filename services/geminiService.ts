// Danh sách các câu slogan vui vẻ có sẵn thay thế cho AI
const FUN_SLOGANS = [
  "Vui vẻ không quạu nha!",
  "Làm hết sức, chơi hết mình!",
  "Đoàn kết là chấp hết!",
  "Thắng không kiêu, bại không nản!",
  "Ăn chơi sợ gì mưa rơi!",
  "Bùng nổ đạp đổ thách thức!",
  "Anh em mình là cái gì nào?",
  "Thích thì chiều, liều thì chiến!",
  "Đi đu đưa đi!",
  "Chơi là phải chất!",
  "Hết mình vì đội nhóm!",
  "Quyết chiến quyết thắng!",
  "Ngại gì vết bẩn!",
  "Cùng nhau tỏa sáng!",
  "Biệt đội siêu anh hùng!",
  "Không say không về!",
  "Mãi bên nhau bạn nhé!",
  "Tuổi trẻ này mình cùng nhau!",
  "Đường đua rực lửa!",
  "Chiến thần gánh team!"
];

const ADMIN_SLOGANS = [
  "Người nắm giữ cuộc chơi",
  "Quyền lực tối thượng",
  "Trùm cuối xuất hiện",
  "Ban Tổ Chức quyền năng",
  "Master of the Game"
];

// Hàm đơn giản không cần async/await phức tạp
export const generateTeamSlogan = (
  name: string,
  team: string,
  raffleNumber: number
): string => {
  if (team === 'ADMIN') {
    return ADMIN_SLOGANS[Math.floor(Math.random() * ADMIN_SLOGANS.length)];
  }
  return FUN_SLOGANS[Math.floor(Math.random() * FUN_SLOGANS.length)];
};