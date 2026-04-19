import React, { useState, useEffect, useMemo, useRef } from 'react';
import { playSound } from '../utils/sounds';
import { 
  Search, Volume2, BookOpen,
  ChevronLeft, ChevronRight, Play, 
  Tags, LayoutGrid, Heart, Plane, GraduationCap, 
  Leaf, Music, Home, Smile, Filter, Sparkles,
  Eye, EyeOff, Mic, CheckCircle
} from 'lucide-react';
import { callAI } from '../utils/openai';
import { parseA2, topicLabels, topicColors } from '../utils/vocabularyData';
import PronunciationModal from './common/PronunciationModal';
import AiAssistantModal from './common/AiAssistantModal';

/* * KỸ THUẬT SIÊU NÉN DỮ LIỆU (STRING COMPRESSION)
 * Định dạng mỗi dòng: word|ipa|pos|meaning|topic_code|example|translation
 * Mã Topic: T (Travel), H (Health), W (Work & Edu), N (Nature), E (Leisure), L (Life), F (Feelings), G (General)
 * Nhờ kỹ thuật này, ta có thể nhúng hơn 460 từ vựng vào 1 file duy nhất mà không bị giới hạn bộ nhớ hay làm treo trình duyệt.
 */
const rawString = `ability|[ə'bıləti]|n|khả năng|F|He has great ability|Anh ấy có khả năng tuyệt vời
abroad|[ə'bro:d]|adv|ở nước ngoài|T|Study abroad|Học ở nước ngoài
accept|[ǝk'sept]|v|chấp nhận|G|Accept the offer|Chấp nhận lời đề nghị
accident|['æksıdənt]|n|tai nạn|L|A car accident|Một vụ tai nạn xe
achieve|[ə'tʃi:v]|v|đạt được|W|Achieve your goals|Đạt được mục tiêu của bạn
active|['æktīv]|adj|tích cực|H|Stay active|Duy trì hoạt động
adult|['ædʌlt]|n|người lớn|L|Only for adults|Chỉ dành cho người lớn
adventure|[əd'ventjər]|n|phiêu lưu|E|An exciting adventure|Cuộc phiêu lưu thú vị
advertise|['ædvərtaız]|v|quảng cáo|W|Advertise on TV|Quảng cáo trên TV
affect|[ə'fekt]|v|ảnh hưởng|G|It affects us|Nó ảnh hưởng đến chúng ta
airline|['eəlaın]|n|hàng không|T|A cheap airline|Hãng hàng không giá rẻ
alive|[ə'laıv]|adj|còn sống|N|The cat is alive|Con mèo còn sống
ancient|['einʃənt]|adj|cổ xưa|G|Ancient history|Lịch sử cổ xưa
ankle|['æŋkl]|n|mắt cá chân|H|I hurt my ankle|Tôi bị đau mắt cá
appear|[ə'pır]|v|xuất hiện|G|He appeared suddenly|Anh ấy xuất hiện đột ngột
architect|['a:rkıtekt]|n|kiến trúc sư|W|A famous architect|Kiến trúc sư nổi tiếng
argue|['a:rgju:]|v|tranh luận|G|Don't argue|Đừng tranh luận
army|['a:rmi]|n|quân đội|W|Join the army|Gia nhập quân đội
asleep|[ə'sli:p]|adj|đang ngủ|L|Fall asleep|Ngủ thiếp đi
athlete|['æθli:t]|n|vận động viên|E|A pro athlete|Vận động viên chuyên nghiệp
attack|[ə'tæk]|v|tấn công|G|The dog attacked|Con chó đã tấn công
attend|[ə'tend]|v|tham dự|W|Attend a meeting|Tham dự cuộc họp
audience|['ɔ:diəns]|n|khán giả|E|A large audience|Một lượng khán giả lớn
available|[ə'veıləbl]|adj|có sẵn|G|Tickets are available|Vé đang có sẵn
average|['ævərıdʒ]|adj|trung bình|G|Above average|Trên mức trung bình
avoid|[ə'vɔıd]|v|tránh|G|Avoid mistakes|Tránh những sai lầm
award|[ə'wɔ:rd]|n|giải thưởng|E|Win an award|Giành giải thưởng
awful|['ɔ:fl]|adj|tồi tệ|F|The weather is awful|Thời tiết thật tồi tệ
background|['bæk,graʊnd]|n|bối cảnh|W|Background music|Nhạc nền
bake|[beık]|v|nướng|L|Bake a cake|Nướng một chiếc bánh
balance|['bæləns]|n|cân bằng|G|Keep your balance|Giữ thăng bằng
baseball|['beısbɔ:l]|n|bóng chày|E|Play baseball|Chơi bóng chày
basic|['beısık]|adj|cơ bản|G|Basic skills|Kỹ năng cơ bản
bear|[ber]|n|con gấu|N|A wild bear|Một con gấu hoang
beat|[bi:t]|v|đánh bại|E|Beat the opponent|Đánh bại đối thủ
behave|[bı'heıv]|v|cư xử|L|Behave well|Cư xử tốt
benefit|['benıfıt]|n|lợi ích|G|Health benefits|Lợi ích sức khỏe
biology|[baı'a:lədʒi]|n|sinh học|W|Study biology|Học sinh học
bit|[bıt]|n|một chút|G|A little bit|Một chút xíu
blood|[blʌd]|n|máu|H|Donate blood|Hiến máu
boil|[bɔıl]|v|đun sôi|L|Boil the water|Đun sôi nước
bone|[boʊn]|n|xương|H|A broken bone|Một khúc xương gãy
borrow|['bɔ:roʊ]|v|mượn|L|Borrow a book|Mượn một cuốn sách
boss|[bɔ:s]|n|sếp|W|My new boss|Sếp mới của tôi
brain|[breın]|n|não|H|Human brain|Não người
brave|[breıv]|adj|dũng cảm|F|A brave boy|Một cậu bé dũng cảm
bridge|[brıdʒ]|n|cây cầu|T|Cross the bridge|Băng qua cầu
brilliant|['brıljənt]|adj|xuất sắc|F|A brilliant idea|Một ý tưởng xuất sắc
burn|[bɜ:rn]|v|đốt cháy|G|Burn the paper|Đốt tờ giấy
camp|[kæmp]|v|cắm trại|E|Go camping|Đi cắm trại
careful|['kerfəl]|adj|cẩn thận|F|Be careful|Hãy cẩn thận
cartoon|[ka:r'tu:n]|n|phim hoạt hình|E|Watch cartoons|Xem phim hoạt hình
cash|[kæʃ]|n|tiền mặt|L|Pay in cash|Trả bằng tiền mặt
castle|['kæsl]|n|lâu đài|T|An old castle|Một lâu đài cổ
catch|[kætʃ]|v|bắt|G|Catch the ball|Bắt lấy quả bóng
cause|[kɔ:z]|n|nguyên nhân|G|The cause of fire|Nguyên nhân hỏa hoạn
celebrate|['selıbreıt]|v|kỷ niệm|E|Celebrate a birthday|Kỷ niệm sinh nhật
center|['sentər]|n|trung tâm|G|City center|Trung tâm thành phố
century|['sentʃəri]|n|thế kỷ|G|21st century|Thế kỷ 21
certain|['sɜ:rtn]|adj|chắc chắn|G|I am certain|Tôi chắc chắn
character|['kærıktər]|n|nhân vật|E|Main character|Nhân vật chính
charity|['tʃærıti]|n|từ thiện|L|Give to charity|Quyên góp từ thiện
chef|[ʃef]|n|đầu bếp|W|A master chef|Đầu bếp tài ba
climate|['klaımət]|n|khí hậu|N|Climate change|Biến đổi khí hậu
clinic|['klınık]|n|phòng khám|H|Dental clinic|Phòng khám nha khoa
coast|[koʊst]|n|bờ biển|T|Walk along the coast|Đi dọc bờ biển
colleague|['ka:li:g]|n|đồng nghiệp|W|Meet a colleague|Gặp gỡ đồng nghiệp
comfortable|['kʌmfərtəbl]|adj|thoải mái|F|A comfortable chair|Chiếc ghế thoải mái
command|[kə'mænd]|n|mệnh lệnh|G|Follow the command|Tuân theo mệnh lệnh
community|[kə'mju:nəti]|n|cộng đồng|L|Local community|Cộng đồng địa phương
company|['kʌmpəni]|n|công ty|W|A tech company|Một công ty công nghệ
compete|[kəm'pi:t]|v|cạnh tranh|W|Compete to win|Cạnh tranh để thắng
complain|[kəm'pleın]|v|phàn nàn|F|Complain about noise|Phàn nàn về tiếng ồn
condition|[kən'dıʃən]|n|điều kiện|G|Good condition|Điều kiện tốt
connect|[kə'nekt]|v|kết nối|W|Connect to Wi-Fi|Kết nối Wi-Fi
consider|[kən'sıdər]|v|xem xét|G|Consider the options|Xem xét các lựa chọn
contain|[kən'teın]|v|chứa đựng|G|Contains sugar|Chứa đường
continue|[kən'tınju:]|v|tiếp tục|G|Continue reading|Tiếp tục đọc
control|[kən'troʊl]|v|kiểm soát|G|Control the car|Kiểm soát xe hơi
cooker|['kʊkər]|n|nồi nấu|L|A rice cooker|Nồi cơm điện
copy|['ka:pi]|v|sao chép|W|Copy the file|Sao chép tệp
count|[kaʊnt]|v|đếm|W|Count to ten|Đếm đến mười
couple|['kʌpl]|n|cặp đôi|L|A married couple|Một cặp vợ chồng
crazy|['kreızi]|adj|điên rồ|F|A crazy idea|Một ý tưởng điên rồ
creative|[kri'eıtıv]|adj|sáng tạo|F|A creative design|Một thiết kế sáng tạo
crime|[kraım]|n|tội ác|L|Commit a crime|Phạm tội ác
criminal|['krımınəl]|n|tội phạm|L|Catch a criminal|Bắt một tên tội phạm
cross|[krɔ:s]|v|băng qua|T|Cross the road|Băng qua đường
crowd|[kraʊd]|n|đám đông|L|A big crowd|Một đám đông lớn
cupboard|['kʌbərd]|n|tủ, kệ|L|In the cupboard|Trong tủ
curly|['kɜ:rli]|adj|xoăn|H|Curly hair|Tóc xoăn
daily|['deıli]|adj|hàng ngày|L|Daily routine|Thói quen hàng ngày
danger|['deındʒər]|n|nguy hiểm|G|In danger|Gặp nguy hiểm
dark|[da:rk]|adj|tối tăm|G|A dark room|Một căn phòng tối
data|['deıtə]|n|dữ liệu|W|Analyze data|Phân tích dữ liệu
dead|[ded]|adj|đã chết|N|A dead tree|Một cái cây đã chết
deaf|[def]|adj|điếc|H|He is deaf|Anh ấy bị điếc
deal|[di:l]|n|thỏa thuận|W|A good deal|Một thỏa thuận tốt
decision|[dı'sıʒən]|n|quyết định|G|Make a decision|Đưa ra quyết định
deep|[di:p]|adj|sâu|N|A deep river|Một con sông sâu
definitely|['defınıtli]|adv|chắc chắn|G|I will definitely go|Tôi chắc chắn sẽ đi
degree|[dı'gri:]|n|bằng cấp|W|A college degree|Bằng đại học
dentist|['dentıst]|n|nha sĩ|H|Visit the dentist|Đi khám nha sĩ
department|[dı'pa:rtmənt]|n|bộ phận|W|Sales department|Bộ phận bán hàng
depend|[dı'pend]|v|phụ thuộc|G|It depends on you|Nó phụ thuộc vào bạn
describe|[dı'skraıb]|v|mô tả|G|Describe the picture|Mô tả bức tranh
desert|['dezərt]|n|sa mạc|N|The Sahara desert|Sa mạc Sahara
design|[dı'zaın]|v|thiết kế|W|Design a website|Thiết kế một trang web
destroy|[dı'strɔı]|v|phá hủy|N|Destroy the building|Phá hủy tòa nhà
detail|['di:teıl]|n|chi tiết|G|More details|Thêm chi tiết
detective|[dı'tektıv]|n|thám tử|W|A private detective|Thám tử tư
develop|[dı'veləp]|v|phát triển|W|Develop a plan|Phát triển một kế hoạch
device|[dı'vaıs]|n|thiết bị|W|Mobile device|Thiết bị di động
digital|['dıdʒıtl]|adj|kỹ thuật số|W|Digital camera|Máy ảnh kỹ thuật số
direction|[dı'rekʃən]|n|phương hướng|T|Wrong direction|Sai phương hướng
disagree|[,dısə'gri:]|v|không đồng ý|G|I disagree with you|Tôi không đồng ý với bạn
disappear|[,dısə'pır]|v|biến mất|G|Disappear completely|Biến mất hoàn toàn
disaster|[dı'zæstər]|n|thảm họa|N|A natural disaster|Thảm họa thiên nhiên
discover|[dı'skʌvər]|v|khám phá|G|Discover new things|Khám phá những điều mới
discussion|[dı'skʌʃən]|n|thảo luận|W|A long discussion|Một cuộc thảo luận dài
disease|[dı'zi:z]|n|bệnh tật|H|Heart disease|Bệnh tim
distance|['dıstəns]|n|khoảng cách|T|Long distance|Khoảng cách dài
divorced|[dı'vɔ:rst]|adj|đã ly dị|L|They got divorced|Họ đã ly dị
document|['da:kjumənt]|n|tài liệu|W|Sign the document|Ký tài liệu
download|['daʊnloʊd]|v|tải xuống|W|Download an app|Tải xuống một ứng dụng
drama|['dra:mə]|n|kịch|E|Watch a drama|Xem một vở kịch
drop|[dra:p]|v|đánh rơi|G|Drop the ball|Đánh rơi quả bóng
duty|['du:ti]|n|nhiệm vụ|W|Do your duty|Làm nhiệm vụ của bạn
earn|[ɜ:rn]|v|kiếm được|W|Earn money|Kiếm tiền
earth|[ɜ:rθ]|n|trái đất|N|Planet Earth|Hành tinh Trái đất
education|[,edʒu'keıʃən]|n|giáo dục|W|Good education|Giáo dục tốt
effect|[ı'fekt]|n|hiệu ứng|G|Side effects|Tác dụng phụ
electric|[ı'lektrık]|adj|điện|G|Electric car|Xe ô tô điện
electricity|[,ılek'trısıti]|n|điện|L|Save electricity|Tiết kiệm điện
electronic|[ı,lek'tra:nık]|adj|điện tử|W|Electronic devices|Thiết bị điện tử
employ|[ım'plɔı]|v|thuê, sử dụng|W|Employ new staff|Thuê nhân viên mới
employee|[ım'plɔıi:]|n|nhân viên|W|A hard-working employee|Một nhân viên chăm chỉ
employer|[ım'plɔıər]|n|nhà tuyển dụng|W|A fair employer|Một nhà tuyển dụng công bằng
empty|['empti]|adj|trống rỗng|G|An empty box|Một chiếc hộp trống
energy|['enərdʒi]|n|năng lượng|N|Solar energy|Năng lượng mặt trời
engine|['endʒın]|n|động cơ|T|Start the engine|Khởi động động cơ
engineer|[,endʒı'nır]|n|kỹ sư|W|A software engineer|Một kỹ sư phần mềm
enormous|[ı'nɔ:rməs]|adj|to lớn|G|An enormous house|Một ngôi nhà to lớn
environment|[ın'vaırənmənt]|n|môi trường|N|Protect the environment|Bảo vệ môi trường
equipment|[ı'kwıpmənt]|n|thiết bị|W|Office equipment|Thiết bị văn phòng
error|['erər]|n|lỗi, sai sót|W|Fix the error|Sửa lỗi
essay|['eseı]|n|bài luận|W|Write an essay|Viết một bài luận
event|[ı'vent]|n|sự kiện|E|A big event|Một sự kiện lớn
evidence|['evıdəns]|n|bằng chứng|W|Find evidence|Tìm bằng chứng
excellent|['eksələnt]|adj|xuất sắc|F|Excellent work!|Làm tốt lắm!
exchange|[ıks'tʃeındʒ]|v|trao đổi|G|Exchange gifts|Trao đổi quà
expect|[ık'spekt]|v|mong đợi|G|Expect good news|Mong đợi tin tốt
experience|[ık'spıriəns]|n|kinh nghiệm|G|Have experience|Có kinh nghiệm
experiment|[ık'sperımənt]|n|thí nghiệm|W|Do an experiment|Làm thí nghiệm
expert|['ekspɜ:rt]|n|chuyên gia|W|An IT expert|Một chuyên gia CNTT
explain|[ık'spleın]|v|giải thích|W|Explain clearly|Giải thích rõ ràng
explanation|[,eksplə'neıʃən]|n|giải thích|W|Clear explanation|Lời giải thích rõ ràng
express|[ık'spres]|v|bày tỏ|F|Express feelings|Bày tỏ cảm xúc
extreme|[ık'stri:m]|adj|cực đoan|G|Extreme weather|Thời tiết khắc nghiệt
factor|['fæktər]|n|yếu tố|G|Key factor|Yếu tố chính
factory|['fæktəri]|n|nhà máy|W|Work in a factory|Làm việc trong nhà máy
fail|[feıl]|v|thất bại|W|Fail the test|Trượt bài kiểm tra
fair|[fer]|adj|công bằng|G|It's not fair|Điều đó không công bằng
fall|[fɔ:l]|v|rơi, ngã|G|Fall down|Ngã xuống
familiar|[fə'mıliər]|adj|quen thuộc|G|A familiar face|Một khuôn mặt quen thuộc
famous|['feıməs]|adj|nổi tiếng|E|A famous actor|Một diễn viên nổi tiếng
fan|[fæn]|n|người hâm mộ|E|A big fan|Một người hâm mộ lớn
fashion|['fæʃən]|n|thời trang|L|Fashion magazine|Tạp chí thời trang
feature|['fi:tʃər]|n|đặc điểm|W|New feature|Tính năng mới
fiction|['fıkʃən]|n|hư cấu|E|Science fiction|Khoa học viễn tưởng
field|[fi:ld]|n|cánh đồng|N|A green field|Một cánh đồng xanh
fight|[faıt]|v|đánh nhau|G|Fight for right|Đấu tranh cho lẽ phải
figure|['fıgjər]|n|con số|W|Sales figures|Doanh số bán hàng
final|['faınl]|adj|cuối cùng|G|Final decision|Quyết định cuối cùng
finally|['faınəli]|adv|cuối cùng thì|G|Finally, he arrived|Cuối cùng anh ấy cũng đến
fit|[fıt]|adj|vừa vặn|L|The shoes fit|Đôi giày vừa vặn
fix|[fıks]|v|sửa chữa|W|Fix the car|Sửa xe ô tô
flight|[flaıt]|n|chuyến bay|T|A long flight|Chuyến bay dài
flu|[flu:]|n|cúm|H|Catch the flu|Bị mắc bệnh cúm
focus|['foʊkəs]|v|tập trung|W|Focus on work|Tập trung vào công việc
fold|[foʊld]|v|gấp lại|L|Fold the clothes|Gấp quần áo
foreign|['fɔ:rın]|adj|nước ngoài|T|Foreign languages|Ngoại ngữ
forest|['fɔ:rıst]|n|rừng|N|A dark forest|Một khu rừng tối
forever|[fər'evər]|adv|mãi mãi|G|Love you forever|Yêu bạn mãi mãi
form|[fɔ:rm]|n|mẫu đơn|W|Fill out the form|Điền vào mẫu đơn
forward|['fɔ:rwərd]|adv|về phía trước|G|Look forward|Nhìn về phía trước
free|[fri:]|adj|miễn phí|G|Free Wi-Fi|Wi-Fi miễn phí
fresh|[freʃ]|adj|tươi mát|L|Fresh fruit|Hoa quả tươi
fridge|[frıdʒ]|n|tủ lạnh|L|In the fridge|Trong tủ lạnh
frightened|['fraıtnd]|adj|hoảng sợ|F|Frightened of dogs|Sợ chó
front|[frʌnt]|n|phía trước|G|In front of you|Ở phía trước bạn
furniture|['fɜ:rnıtʃər]|n|nội thất|L|Buy furniture|Mua đồ nội thất
future|['fju:tʃər]|n|tương lai|G|In the future|Trong tương lai
gallery|['gæləri]|n|phòng trưng bày|E|Art gallery|Phòng trưng bày nghệ thuật
gap|[gæp]|n|khoảng cách|G|Mind the gap|Chú ý khoảng trống
gas|[gæs]|n|khí gas|L|Turn off the gas|Tắt bếp gas
general|['dʒenərəl]|adj|chung chung|G|General rule|Quy tắc chung
generally|['dʒenərəli]|adv|nhìn chung|G|Generally speaking|Nhìn chung mà nói
generation|[,dʒenə'reıʃən]|n|thế hệ|L|New generation|Thế hệ mới
generous|['dʒenərəs]|adj|hào phóng|F|A generous man|Một người đàn ông hào phóng
gentle|['dʒentl]|adj|nhẹ nhàng|F|A gentle touch|Một cái chạm nhẹ nhàng
geography|[dʒi'a:grəfi]|n|địa lý|W|Study geography|Học môn địa lý
goal|[goʊl]|n|mục tiêu|G|Reach a goal|Đạt được mục tiêu
government|['gʌvərnmənt]|n|chính phủ|W|Government rules|Quy định chính phủ
grab|[græb]|v|vồ lấy|G|Grab a coffee|Lấy vội một cốc cà phê
grade|[greıd]|n|điểm số|W|Get a good grade|Đạt điểm cao
grammar|['græmər]|n|ngữ pháp|W|English grammar|Ngữ pháp tiếng Anh
grand|[grænd]|adj|hoành tráng|G|A grand party|Một bữa tiệc hoành tráng
grant|[grænt]|v|cấp, ban|W|Grant permission|Cấp phép
grateful|['greıtfl]|adj|biết ơn|F|I am grateful|Tôi rất biết ơn
ground|[graʊnd]|n|mặt đất|N|On the ground|Trên mặt đất
guard|[ga:rd]|n|bảo vệ|W|A security guard|Bảo vệ an ninh
guess|[ges]|v|đoán|G|Guess what?|Đoán xem nào?
guest|[gest]|n|khách|L|A special guest|Một vị khách đặc biệt
guide|[gaıd]|n|hướng dẫn|T|Tour guide|Hướng dẫn viên du lịch
guilty|['gılti]|adj|có tội|F|Feel guilty|Cảm thấy có lỗi
gun|[gʌn]|n|súng|G|Hold a gun|Cầm một khẩu súng
habit|['hæbıt]|n|thói quen|H|Good habit|Thói quen tốt
half|[hæf]|n|một nửa|G|Half an hour|Nửa giờ
handle|['hændl]|v|xử lý|W|Handle the problem|Xử lý vấn đề
hang|[hæŋ]|v|treo|L|Hang the picture|Treo bức tranh
happen|['hæpən]|v|xảy ra|G|What happened?|Có chuyện gì xảy ra vậy?
happiness|['hæpinəs]|n|hạnh phúc|F|Pursuit of happiness|Mưu cầu hạnh phúc
happy|['hæpi]|adj|hạnh phúc|F|Very happy|Rất hạnh phúc
hard|[ha:rd]|adj|khó khăn|G|A hard test|Một bài kiểm tra khó
hardly|['ha:rdli]|adv|hầu như không|G|I hardly know him|Tôi hầu như không biết anh ấy
hate|[heıt]|v|ghét|F|I hate spiders|Tôi ghét nhện
head|[hed]|n|cái đầu|H|My head hurts|Đầu tôi bị đau
headache|['hedeık]|n|đau đầu|H|I have a headache|Tôi bị đau đầu
health|[helθ]|n|sức khỏe|H|Good health|Sức khỏe tốt
healthy|['helθi]|adj|khỏe mạnh|H|Stay healthy|Giữ gìn sức khỏe
heart|[ha:rt]|n|trái tim|H|A kind heart|Một trái tim nhân hậu
heat|[hi:t]|n|sức nóng|N|Summer heat|Sức nóng mùa hè
heavy|['hevi]|adj|nặng|G|A heavy bag|Một cái túi nặng
height|[haıt]|n|chiều cao|G|Measure height|Đo chiều cao
helpful|['helpfl]|adj|hữu ích|F|A helpful person|Một người hay giúp đỡ
hero|['hıroʊ]|n|anh hùng|E|A national hero|Một vị anh hùng dân tộc
hide|[haıd]|v|trốn, giấu|G|Hide and seek|Trò chơi trốn tìm
history|['hıstəri]|n|lịch sử|W|Study history|Học lịch sử
hit|[hıt]|v|đánh|G|Hit the ball|Đánh quả bóng
hobby|['ha:bi]|n|sở thích|E|My hobby is reading|Sở thích của tôi là đọc sách
hockey|['ha:ki]|n|khúc côn cầu|E|Play hockey|Chơi khúc côn cầu
hold|[hoʊld]|v|cầm, giữ|G|Hold my hand|Giữ tay tôi
hole|[hoʊl]|n|cái lỗ|G|A deep hole|Một cái hố sâu
holiday|['ha:lədeı]|n|kỳ nghỉ|T|Summer holiday|Kỳ nghỉ hè
honest|['a:nıst]|adj|trung thực|F|An honest man|Một người trung thực
hope|[hoʊp]|v|hy vọng|F|I hope so|Tôi hy vọng vậy
horrible|['hɔ:rəbl]|adj|khủng khiếp|F|A horrible day|Một ngày khủng khiếp
horror|['hɔ:rər]|n|kinh dị|E|Horror movie|Phim kinh dị
host|[hoʊst]|n|chủ nhà|L|A gracious host|Một người chủ hiếu khách
huge|[hju:dʒ]|adj|khổng lồ|G|A huge building|Một tòa nhà khổng lồ
human|['hju:mən]|n|con người|G|Human beings|Loài người
hurt|[hɜ:rt]|v|làm đau|H|It hurts|Nó bị đau
identify|[aı'dentıfaı]|v|nhận dạng|G|Identify the suspect|Nhận dạng nghi phạm
illness|['ılnəs]|n|bệnh tật|H|A serious illness|Một căn bệnh nghiêm trọng
imagine|[ı'mædʒın]|v|tưởng tượng|F|Imagine a world|Tưởng tượng một thế giới
immediately|[ı'mi:diətli]|adv|ngay lập tức|G|Call immediately|Gọi ngay lập tức
impossible|[ım'pa:səbl]|adj|không thể|G|Impossible to do|Không thể làm được
include|[ın'klu:d]|v|bao gồm|G|Price includes tax|Giá đã bao gồm thuế
income|['ınkʌm]|n|thu nhập|W|High income|Thu nhập cao
independent|[,ındı'pendənt]|adj|độc lập|F|An independent woman|Một người phụ nữ độc lập
industry|['ındəstri]|n|công nghiệp|W|Car industry|Ngành công nghiệp ô tô
informal|[ın'fɔ:rml]|adj|thân mật|G|Informal clothes|Quần áo thường ngày
injury|['ındʒəri]|n|chấn thương|H|A leg injury|Chấn thương chân
insect|['ınsekt]|n|côn trùng|N|A flying insect|Một loài côn trùng bay
inside|[ın'saıd]|adv|bên trong|G|Go inside|Đi vào bên trong
instead|[ın'sted]|adv|thay vì|G|Play instead of work|Chơi thay vì làm việc
instruction|[ın'strʌkʃən]|n|hướng dẫn|W|Follow instructions|Làm theo hướng dẫn
instrument|['ınstrəmənt]|n|nhạc cụ|E|Musical instrument|Nhạc cụ âm nhạc
intelligent|[ın'telıdʒənt]|adj|thông minh|F|Intelligent boy|Cậu bé thông minh
international|[,ıntər'næʃənl]|adj|quốc tế|G|International flight|Chuyến bay quốc tế
interview|['ıntərvju:]|n|phỏng vấn|W|Job interview|Phỏng vấn xin việc
introduce|[,ıntrə'du:s]|v|giới thiệu|G|Introduce a friend|Giới thiệu một người bạn
invent|[ın'vent]|v|phát minh|W|Invent a machine|Phát minh ra máy móc
invention|[ın'venʃən]|n|phát minh|W|A great invention|Một phát minh tuyệt vời
invite|[ın'vaıt]|v|mời|L|Invite to a party|Mời đến bữa tiệc
island|['aılənd]|n|hòn đảo|T|A beautiful island|Một hòn đảo tuyệt đẹp
item|['aıtəm]|n|món đồ|G|Buy an item|Mua một món đồ
jewellery|['dʒu:əlri]|n|trang sức|L|Gold jewellery|Trang sức bằng vàng
join|[dʒɔın]|v|tham gia|G|Join a club|Tham gia câu lạc bộ
joke|[dʒoʊk]|n|trò đùa|L|Tell a joke|Kể một câu chuyện đùa
journalist|['dʒɜ:rnəlıst]|n|nhà báo|W|A famous journalist|Một nhà báo nổi tiếng
journey|['dʒɜ:rni]|n|hành trình|T|A long journey|Một hành trình dài
judge|[dʒʌdʒ]|n|thẩm phán|W|A fair judge|Một vị thẩm phán công bằng
jump|[dʒʌmp]|v|nhảy|E|Jump high|Nhảy cao
jungle|['dʒʌŋgl]|n|rừng rậm|N|In the jungle|Trong rừng rậm
justice|['dʒʌstıs]|n|công lý|G|Demand justice|Đòi hỏi công lý
keep|[ki:p]|v|giữ|G|Keep the change|Giữ lại tiền lẻ
key|[ki:]|n|chìa khóa|L|House key|Chìa khóa nhà
kick|[kık]|v|đá|E|Kick the ball|Đá quả bóng
kid|[kıd]|n|đứa trẻ|L|A smart kid|Một đứa trẻ thông minh
kill|[kıl]|v|giết|G|Kill a bug|Giết một con bọ
kind|[kaınd]|adj|tốt bụng|F|Be kind to others|Hãy tốt bụng với người khác
king|[kıŋ]|n|vua|G|King of England|Vua nước Anh
kiss|[kıs]|v|hôn|F|Kiss goodnight|Hôn chúc ngủ ngon
knee|[ni:]|n|đầu gối|H|Bend your knee|Uốn cong đầu gối
knife|[naıf]|n|con dao|L|A sharp knife|Một con dao sắc bén
knock|[na:k]|v|gõ cửa|L|Knock on the door|Gõ cửa
knowledge|['na:lıdʒ]|n|kiến thức|W|Basic knowledge|Kiến thức cơ bản
lack|[læk]|n|sự thiếu hụt|G|Lack of sleep|Sự thiếu ngủ
ladder|['lædər]|n|cái thang|L|Climb a ladder|Trèo thang
lake|[leık]|n|hồ nước|N|Swim in the lake|Bơi ở hồ
landscape|['lændskeıp]|n|phong cảnh|N|A beautiful landscape|Một phong cảnh đẹp
laptop|['læpta:p]|n|máy tính xách tay|W|Use a laptop|Sử dụng máy tính xách tay
large|[la:rdʒ]|adj|lớn|G|A large pizza|Một chiếc bánh pizza lớn
laugh|[læf]|v|cười|F|Make me laugh|Làm tôi cười
law|[lɔ:]|n|luật pháp|W|Break the law|Phạm luật
lawyer|['lɔ:jər]|n|luật sư|W|Hire a lawyer|Thuê một luật sư
lazy|['leızi]|adj|lười biếng|F|A lazy cat|Một con mèo lười biếng
lead|[li:d]|v|dẫn dắt|W|Lead the team|Dẫn dắt đội
leader|['li:dər]|n|lãnh đạo|W|A strong leader|Một nhà lãnh đạo mạnh mẽ
leaf|[li:f]|n|chiếc lá|N|A green leaf|Một chiếc lá xanh
league|[li:g]|n|liên đoàn|E|Football league|Liên đoàn bóng đá
learn|[lɜ:rn]|v|học|W|Learn English|Học tiếng Anh
least|[li:st]|adv|ít nhất|G|At least once|Ít nhất một lần
leather|['leðər]|n|da|L|Leather jacket|Áo khoác da
leave|[li:v]|v|rời đi|G|Leave the room|Rời khỏi phòng
lecture|['lektʃər]|n|bài giảng|W|Attend a lecture|Tham dự bài giảng
length|[leŋθ]|n|chiều dài|G|Measure the length|Đo chiều dài
less|[les]|adv|ít hơn|G|Less money|Ít tiền hơn
letter|['letər]|n|lá thư|L|Write a letter|Viết một lá thư
level|['levl]|n|cấp độ|W|High level|Cấp độ cao
lie|[laı]|v|nói dối|F|Don't lie to me|Đừng nói dối tôi
life|[laıf]|n|cuộc sống|L|Enjoy life|Tận hưởng cuộc sống
lifestyle|['laıfstaıl]|n|lối sống|L|Healthy lifestyle|Lối sống lành mạnh
lift|[lıft]|v|nâng lên|H|Lift heavy weights|Nâng tạ nặng
light|[laıt]|n|ánh sáng|G|Turn on the light|Bật đèn
likely|['laıkli]|adj|có khả năng|G|It is likely to rain|Trời có khả năng sẽ mưa
limit|['lımıt]|n|giới hạn|G|Speed limit|Giới hạn tốc độ
line|[laın]|n|đường thẳng|G|Draw a line|Vẽ một đường thẳng
link|[lıŋk]|n|liên kết|W|Click the link|Nhấp vào liên kết
list|[lıst]|n|danh sách|G|Shopping list|Danh sách mua sắm
listen|['lısn]|v|lắng nghe|G|Listen to music|Nghe nhạc
literature|['lıtrətʃər]|n|văn học|W|English literature|Văn học tiếng Anh
live|[lıv]|v|sống|L|Live in a city|Sống ở thành phố
local|['loʊkl]|adj|địa phương|G|Local food|Món ăn địa phương
lock|[la:k]|v|khóa|L|Lock the door|Khóa cửa
lonely|['loʊnli]|adj|cô đơn|F|Feel lonely|Cảm thấy cô đơn
look|[lʊk]|v|nhìn|G|Look at this|Nhìn cái này đi
lose|[lu:z]|v|làm mất|G|Lose a key|Làm mất chìa khóa
loud|[laʊd]|adj|to, ồn ào|G|Loud noise|Tiếng ồn lớn
love|[lʌv]|v|yêu|F|Love your family|Yêu gia đình bạn
low|[loʊ]|adj|thấp|G|Low price|Giá thấp
luck|[lʌk]|n|may mắn|G|Good luck!|Chúc may mắn!
lucky|['lʌki]|adj|may mắn|F|I feel lucky|Tôi cảm thấy may mắn
machine|[mə'ʃi:n]|n|máy móc|W|A washing machine|Một chiếc máy giặt
mad|[mæd]|adj|điên, tức giận|F|He is mad at me|Anh ấy đang giận tôi
magic|['mædʒık]|n|phép thuật|E|Magic trick|Trò ảo thuật
mail|[meıl]|n|thư tín|W|Send an email|Gửi một email
main|[meın]|adj|chính|G|Main street|Con phố chính
mainly|['meınli]|adv|chủ yếu|G|Mainly because|Chủ yếu là vì
major|['meıdʒər]|adj|lớn, trọng đại|G|Major problem|Vấn đề lớn
male|[meıl]|n|nam giới|G|Male or female|Nam hay nữ
manage|['mænıdʒ]|v|quản lý|W|Manage a team|Quản lý một nhóm
manager|['mænıdʒər]|n|người quản lý|W|Project manager|Người quản lý dự án
manner|['mænər]|n|cách cư xử|L|Good manners|Cách cư xử tốt
mark|[ma:rk]|n|điểm số, dấu|W|A high mark|Một điểm số cao
market|['ma:rkıt]|n|chợ|L|Super market|Siêu thị
marry|['mæri]|v|kết hôn|L|Get married|Kết hôn
master|['mæstər]|n|thạc sĩ, chuyên gia|W|Master's degree|Bằng thạc sĩ
match|[mætʃ]|n|trận đấu|E|Football match|Trận đấu bóng đá
material|[mə'tıriəl]|n|vật liệu|G|Building material|Vật liệu xây dựng
mathematics|[,mæθə'mætık]|n|toán học|W|Study mathematics|Học môn toán
matter|['mætər]|n|vấn đề|G|It doesn't matter|Điều đó không quan trọng
maximum|['mæksıməm]|adj|tối đa|G|Maximum speed|Tốc độ tối đa
mean|[mi:n]|v|có nghĩa là|G|What do you mean?|Ý bạn là gì?
meaning|['mi:nıŋ]|n|ý nghĩa|G|The meaning of life|Ý nghĩa cuộc sống
measure|['meʒər]|v|đo lường|G|Measure the room|Đo căn phòng
meat|[mi:t]|n|thịt|L|Eat meat|Ăn thịt
media|['mi:diə]|n|phương tiện truyền thông|W|Social media|Mạng xã hội
medicine|['medısn]|n|thuốc|H|Take medicine|Uống thuốc
memory|['meməri]|n|trí nhớ|H|Good memory|Trí nhớ tốt
mental|['mentl]|adj|tinh thần|H|Mental health|Sức khỏe tinh thần
mention|['menʃən]|v|đề cập|G|Don't mention it|Đừng bận tâm
message|['mesıdʒ]|n|tin nhắn|W|Send a message|Gửi tin nhắn
metal|['metl]|n|kim loại|G|Made of metal|Làm bằng kim loại
method|['meθəd]|n|phương pháp|W|A new method|Một phương pháp mới
middle|['mıdl]|n|ở giữa|G|In the middle|Ở giữa
might|[maıt]|modal|có thể|G|I might go|Tôi có thể sẽ đi
mind|[maınd]|n|tâm trí|H|Keep in mind|Hãy ghi nhớ
mine|[maın]|pron|của tôi|G|It is mine|Nó là của tôi
minimum|['mınıməm]|adj|tối thiểu|G|Minimum wage|Mức lương tối thiểu
mirror|['mırər]|n|chiếc gương|L|Look in the mirror|Nhìn vào gương
missing|['mısıŋ]|adj|mất tích|G|A missing child|Một đứa trẻ mất tích
mistake|[mı'steık]|n|sai lầm|G|Make a mistake|Mắc sai lầm
mix|[mıks]|v|trộn|L|Mix the colors|Trộn các màu lại
model|['ma:dl]|n|người mẫu, mô hình|E|A fashion model|Một người mẫu thời trang
modern|['ma:dərn]|adj|hiện đại|G|Modern art|Nghệ thuật hiện đại
moment|['moʊmənt]|n|khoảnh khắc|G|Wait a moment|Đợi một lát
money|['mʌni]|n|tiền|L|Earn money|Kiếm tiền
monkey|['mʌŋki]|n|con khỉ|N|A cute monkey|Một con khỉ dễ thương
mood|[mu:d]|n|tâm trạng|F|In a good mood|Đang trong tâm trạng tốt
moon|[mu:n]|n|mặt trăng|N|The full moon|Mặt trăng tròn
morning|['mɔ:rnıŋ]|n|buổi sáng|G|Good morning|Chào buổi sáng
motorcycle|['moʊtərsaıkl]|n|xe máy|T|Ride a motorcycle|Đi xe máy
mountain|['maʊntn]|n|ngọn núi|N|Climb a mountain|Leo núi
mouse|[maʊs]|n|con chuột|N|Computer mouse|Chuột máy tính
mouth|[maʊθ]|n|cái miệng|H|Open your mouth|Mở miệng ra
move|[mu:v]|v|di chuyển|G|Move the table|Di chuyển cái bàn
movement|['mu:vmənt]|n|sự chuyển động|G|Slow movement|Chuyển động chậm
movie|['mu:vi]|n|bộ phim|E|Watch a movie|Xem một bộ phim
much|[mʌtʃ]|adv|nhiều|G|Thank you very much|Cảm ơn bạn rất nhiều
murder|['mɜ:rdər]|n|kẻ giết người|L|A murder mystery|Một vụ bí ẩn giết người
muscle|['mʌsl]|n|cơ bắp|H|Build muscle|Xây dựng cơ bắp
museum|[mju:'zi:əm]|n|bảo tàng|E|Visit a museum|Thăm một bảo tàng
music|['mju:zık]|n|âm nhạc|E|Listen to music|Nghe nhạc
musical|['mju:zıkl]|adj|thuộc về âm nhạc|E|A musical instrument|Một nhạc cụ
musician|[mju:'zıʃn]|n|nhạc sĩ|E|A famous musician|Một nhạc sĩ nổi tiếng
mystery|['mıstəri]|n|điều bí ẩn|E|A murder mystery|Một vụ bí ẩn giết người
nail|[neıl]|n|móng tay, cái đinh|H|Cut your nails|Cắt móng tay của bạn
narrow|['næroʊ]|adj|hẹp|G|A narrow road|Một con đường hẹp
nation|['neıʃən]|n|quốc gia|G|A powerful nation|Một quốc gia hùng mạnh
national|['næʃənl]|adj|thuộc quốc gia|G|National holiday|Quốc khánh
natural|['nætʃrəl]|adj|tự nhiên|N|Natural resources|Tài nguyên thiên nhiên
nature|['neıtʃər]|n|thiên nhiên|N|Love nature|Yêu thiên nhiên
near|[nır]|prep|gần|G|Near the park|Gần công viên
nearly|['nırli]|adv|gần như|G|Nearly finished|Gần như đã xong
neat|[ni:t]|adj|gọn gàng|L|A neat room|Một căn phòng gọn gàng
necessary|['nesəseri]|adj|cần thiết|G|It is necessary|Điều đó là cần thiết
neck|[nek]|n|cái cổ|H|My neck hurts|Cổ tôi bị đau
need|[ni:d]|v|cần|G|I need help|Tôi cần sự giúp đỡ
negative|['negətıv]|adj|tiêu cực|F|Negative thoughts|Những suy nghĩ tiêu cực
neighbor|['neıbər]|n|hàng xóm|L|A friendly neighbor|Một người hàng xóm thân thiện
neighborhood|['neıbərhʊd]|n|khu vực lân cận|L|A quiet neighborhood|Một khu phố yên tĩnh
neither|['ni:ðər]|pron|cũng không|G|Neither of them|Không ai trong số họ
nervous|['nɜ:rvəs]|adj|lo lắng|F|Feel nervous|Cảm thấy lo lắng
network|['netwɜ:rk]|n|mạng lưới|W|Computer network|Mạng máy tính
never|['nevər]|adv|không bao giờ|G|Never give up|Không bao giờ bỏ cuộc
normal|['nɔ:rml]|adj|bình thường|G|Normal day|Một ngày bình thường
normally|['nɔ:rməli]|adv|thông thường|G|I normally walk|Tôi thường đi bộ
novel|['na:vl]|n|tiểu thuyết|E|Read a novel|Đọc một cuốn tiểu thuyết
nowhere|['noʊwer]|adv|không nơi nào|G|Nowhere to go|Không có nơi nào để đi
number|['nʌmbər]|n|con số|W|A phone number|Một số điện thoại
nurse|[nɜ:rs]|n|y tá|H|A hospital nurse|Một y tá bệnh viện
nut|[nʌt]|n|hạt dẻ, con ốc|L|Eat some nuts|Ăn một số loại hạt
object|['a:bdʒekt]|n|đồ vật|G|A sharp object|Một vật sắc nhọn
obvious|['a:bviəs]|adj|rõ ràng|G|It's obvious|Điều đó là rõ ràng
obviously|['a:bviəsli]|adv|một cách rõ ràng|G|Obviously wrong|Rõ ràng là sai
occasion|[ə'keıʒən]|n|dịp|L|A special occasion|Một dịp đặc biệt
ocean|['oʊʃən]|n|đại dương|N|Pacific Ocean|Đại dương Thái Bình Dương
offer|['ɔ:fər]|v|đề nghị|W|Job offer|Lời mời làm việc
officer|['ɔ:fısər]|n|sĩ quan|W|Police officer|Sĩ quan cảnh sát
official|[ə'fıʃl]|adj|chính thức|W|Official document|Tài liệu chính thức
often|['ɔ:fn]|adv|thường xuyên|G|I often run|Tôi thường chạy
operation|[,a:pə'reıʃən]|n|sự hoạt động, ca mổ|H|A heart operation|Một ca mổ tim
opinion|[ə'pınjən]|n|ý kiến|G|In my opinion|Theo ý kiến của tôi
opportunity|[,a:pər'tu:nəti]|n|cơ hội|W|Great opportunity|Cơ hội tuyệt vời
opposite|['a:pəzıt]|adj|đối diện|G|Opposite direction|Hướng ngược lại
option|['a:pʃən]|n|lựa chọn|G|A good option|Một lựa chọn tốt
ordinary|['ɔ:rdneri]|adj|bình thường|G|An ordinary day|Một ngày bình thường
organization|[,ɔ:rgənə'zeıʃən]|n|tổ chức|W|A big organization|Một tổ chức lớn
organize|['ɔ:rgənaız]|v|tổ chức|W|Organize an event|Tổ chức một sự kiện
original|[ə'rıdʒənl]|adj|nguyên bản|G|Original idea|Ý tưởng ban đầu
ourselves|[aʊər'selvz]|pron|chính chúng ta|G|We did it ourselves|Chúng ta đã tự làm điều đó
outside|[,aʊt'saıd]|adv|bên ngoài|G|Go outside|Đi ra ngoài
oven|['ʌvn]|n|lò nướng|L|Bake in the oven|Nướng trong lò
own|[oʊn]|v|sở hữu|L|Own a house|Sở hữu một ngôi nhà
owner|['oʊnər]|n|chủ nhân|L|The owner of the dog|Chủ nhân của con chó
pack|[pæk]|v|đóng gói|T|Pack a bag|Đóng gói một chiếc túi
pain|[peın]|n|cơn đau|H|Feel pain|Cảm thấy đau
paint|[peınt]|v|sơn, vẽ|E|Paint a picture|Vẽ một bức tranh
painter|['peıntər]|n|họa sĩ|E|A famous painter|Một họa sĩ nổi tiếng
painting|['peıntıŋ]|n|bức tranh|E|A beautiful painting|Một bức tranh đẹp
pair|[per]|n|đôi, cặp|G|A pair of shoes|Một đôi giày
palace|['pæləs]|n|cung điện|T|Royal palace|Cung điện hoàng gia
pale|[peıl]|adj|nhợt nhạt|H|Look pale|Trông nhợt nhạt
pan|[pæn]|n|cái chảo|L|Frying pan|Cái chảo rán
pants|[pænts]|n|quần dài|L|A pair of pants|Một chiếc quần dài
paper|['peıpər]|n|giấy|W|A piece of paper|Một mảnh giấy
paragraph|['pærəgræf]|n|đoạn văn|W|Write a paragraph|Viết một đoạn văn
pardon|['pa:rdn]|n|sự tha thứ, xin lỗi|G|Pardon me?|Xin lỗi bạn nói gì cơ?
parent|['perənt]|n|phụ huynh|L|My parents|Bố mẹ tôi
park|[pa:rk]|n|công viên|E|Go to the park|Đi đến công viên
part|[pa:rt]|n|phần|G|Part of the plan|Một phần của kế hoạch
particular|[pər'tıkjələr]|adj|cụ thể|G|In particular|Nói riêng
partner|['pa:rtnər]|n|đối tác|W|Business partner|Đối tác kinh doanh
party|['pa:rti]|n|bữa tiệc|L|Birthday party|Bữa tiệc sinh nhật
pass|[pæs]|v|vượt qua|W|Pass the exam|Vượt qua kỳ thi
passenger|['pæsındʒər]|n|hành khách|T|Train passengers|Hành khách trên tàu
passport|['pæspɔ:rt]|n|hộ chiếu|T|Show your passport|Xuất trình hộ chiếu của bạn
past|[pæst]|n|quá khứ|G|In the past|Trong quá khứ
path|[pæθ]|n|con đường|N|A forest path|Một con đường rừng
patient|['peıʃənt]|n|bệnh nhân|H|Care for patients|Chăm sóc bệnh nhân
pattern|['pætərn]|n|mô hình, hoa văn|G|A nice pattern|Một hoa văn đẹp
pause|[pɔ:z]|v|tạm dừng|G|Pause the video|Tạm dừng video
pay|[peı]|v|trả tiền|L|Pay the bill|Trả hóa đơn
peace|[pi:s]|n|hòa bình|G|World peace|Hòa bình thế giới
peaceful|['pi:sfl]|adj|yên bình|F|A peaceful place|Một nơi yên bình
pen|[pen]|n|cây bút|W|Write with a pen|Viết bằng bút
pencil|['pensl]|n|bút chì|W|A sharp pencil|Một cây bút chì sắc
penny|['peni]|n|đồng xu|L|Not a single penny|Không một đồng xu nào
people|['pi:pl]|n|mọi người|G|Many people|Nhiều người
pepper|['pepər]|n|hạt tiêu|L|Salt and pepper|Muối và hạt tiêu
perfect|['pɜ:rfıkt]|adj|hoàn hảo|G|A perfect day|Một ngày hoàn hảo
perfectly|['pɜ:rfıktli]|adv|một cách hoàn hảo|G|Perfectly fine|Hoàn toàn ổn
perform|[pər'fɔ:rm]|v|biểu diễn|E|Perform on stage|Biểu diễn trên sân khấu
performance|[pər'fɔ:rməns]|n|sự biểu diễn|E|Live performance|Buổi biểu diễn trực tiếp
perhaps|[pər'hæps]|adv|có lẽ|G|Perhaps it will rain|Có lẽ trời sẽ mưa
period|['pıriəd]|n|giai đoạn|G|A period of time|Một khoảng thời gian
permission|[pər'mıʃən]|n|sự cho phép|W|Ask for permission|Xin phép
person|['pɜ:rsn]|n|người|G|A nice person|Một người tốt
personal|['pɜ:rsənl]|adj|cá nhân|G|Personal space|Không gian cá nhân
personality|[,pɜ:rsə'næləti]|n|tính cách|F|Nice personality|Tính cách tốt
pet|[pet]|n|thú cưng|L|My pet dog|Chú chó cưng của tôi
phase|[feız]|n|giai đoạn|G|The next phase|Giai đoạn tiếp theo
philosophy|[fı'la:səfi]|n|triết học|W|Study philosophy|Học môn triết học
phone|[foʊn]|n|điện thoại|L|My new phone|Chiếc điện thoại mới của tôi
photo|['foʊtoʊ]|n|bức ảnh|E|Take a photo|Chụp một bức ảnh
photograph|['foʊtəgræf]|n|bức ảnh|E|A beautiful photograph|Một bức ảnh đẹp
photographer|[fə'ta:grəfər]|n|nhiếp ảnh gia|W|A professional photographer|Nhiếp ảnh gia chuyên nghiệp
physics|['fızıks]|n|vật lý|W|Study physics|Học vật lý
piano|[pi'ænoʊ]|n|đàn piano|E|Play the piano|Chơi đàn piano
pick|[pık]|v|nhặt, hái|G|Pick an apple|Hái một quả táo
picture|['pıktʃər]|n|bức tranh|E|Draw a picture|Vẽ một bức tranh
piece|[pi:s]|n|mảnh, miếng|G|A piece of cake|Một miếng bánh
pig|[pıg]|n|con lợn|N|A pink pig|Một con lợn màu hồng
pilot|['paılət]|n|phi công|W|An airline pilot|Một phi công hàng không
pin|[pın]|n|cái ghim|W|A safety pin|Một cái ghim băng
pink|[pıŋk]|adj|màu hồng|G|A pink dress|Một chiếc váy màu hồng
pipe|[paıp]|n|ống nước|L|A broken pipe|Một ống nước bị vỡ
pitch|[pıtʃ]|n|sân cỏ|E|Football pitch|Sân bóng đá
pity|['pıti]|n|sự thương hại|F|What a pity!|Thật đáng tiếc!
place|[pleıs]|n|nơi chốn|G|A beautiful place|Một nơi xinh đẹp
plain|[pleın]|adj|trơn, giản dị|G|Plain yogurt|Sữa chua không đường
plan|[plæn]|n|kế hoạch|W|Make a plan|Lập một kế hoạch
plane|[pleın]|n|máy bay|T|Fly a plane|Lái máy bay
planet|['plænıt]|n|hành tinh|N|Planet Earth|Hành tinh Trái đất
plant|[plænt]|n|thực vật|N|Water the plants|Tưới cây
plastic|['plæstık]|n|nhựa|G|Plastic bag|Túi nhựa
plate|[pleıt]|n|cái đĩa|L|A clean plate|Một cái đĩa sạch
platform|['plætfɔ:rm]|n|sân ga|T|Train platform|Sân ga tàu hỏa
play|[pleı]|v|chơi|E|Play a game|Chơi một trò chơi
player|['pleıər]|n|người chơi|E|A football player|Một cầu thủ bóng đá
pleasant|['pleznt]|adj|dễ chịu|F|A pleasant surprise|Một bất ngờ thú vị
please|[pli:z]|v|làm ơn|G|Please help me|Làm ơn giúp tôi
pleased|[pli:zd]|adj|hài lòng|F|I am pleased|Tôi rất hài lòng
pleasure|['pleʒər]|n|niềm vui|F|My pleasure|Rất hân hạnh
plenty|['plenti]|pron|nhiều|G|Plenty of time|Nhiều thời gian
pocket|['pa:kıt]|n|túi quần|L|In my pocket|Trong túi của tôi
poem|['poʊəm]|n|bài thơ|E|Write a poem|Viết một bài thơ
poet|['poʊət]|n|nhà thơ|E|A famous poet|Một nhà thơ nổi tiếng
poetry|['poʊətri]|n|thơ ca|E|Read poetry|Đọc thơ
point|[pɔınt]|n|điểm|G|Make a point|Đưa ra một quan điểm
poison|['pɔızn]|n|chất độc|H|Snake poison|Nọc độc rắn
police|[pə'li:s]|n|cảnh sát|W|Call the police|Gọi cảnh sát
policeman|[pə'li:smən]|n|nam cảnh sát|W|A brave policeman|Một cảnh sát dũng cảm
policy|['pa:ləsi]|n|chính sách|W|Company policy|Chính sách công ty
polite|[pə'laıt]|adj|lịch sự|F|Be polite|Hãy lịch sự
political|[pə'lıtıkl]|adj|thuộc chính trị|W|Political issues|Các vấn đề chính trị
politician|[,pa:lə'tıʃn]|n|chính trị gia|W|A famous politician|Một chính trị gia nổi tiếng
politics|['pa:lətıks]|n|chính trị|W|Study politics|Học về chính trị
pollution|[pə'lu:ʃən]|n|ô nhiễm|N|Air pollution|Ô nhiễm không khí
pool|[pu:l]|n|hồ bơi|E|Swimming pool|Hồ bơi
poor|[pʊr]|adj|nghèo|G|A poor family|Một gia đình nghèo
pop|[pa:p]|n|nhạc pop|E|Pop music|Nhạc pop
popular|['pa:pjələr]|adj|phổ biến|G|A popular song|Một bài hát phổ biến
population|[,pa:pju'leıʃən]|n|dân số|G|High population|Dân số cao
port|[pɔ:rt]|n|cảng|T|A busy port|Một bến cảng bận rộn
position|[pə'zıʃən]|n|vị trí|W|Job position|Vị trí công việc
positive|['pa:zətıv]|adj|tích cực|F|Positive thinking|Suy nghĩ tích cực
possibility|[,pa:sə'bıləti]|n|khả năng|G|A strong possibility|Một khả năng cao
possible|['pa:səbl]|adj|có thể|G|Is it possible?|Có thể không?
possibly|['pa:səbli]|adv|có thể|G|Possibly true|Có thể là đúng
post|[poʊst]|n|bưu điện|W|Post office|Bưu điện
poster|['poʊstər]|n|áp phích|L|A movie poster|Một tấm áp phích phim
pot|[pa:t]|n|cái nồi|L|A cooking pot|Một chiếc nồi nấu ăn
potato|[pə'teıtoʊ]|n|khoai tây|L|Mashed potatoes|Khoai tây nghiền
potential|[pə'tenʃl]|adj|tiềm năng|W|Potential customer|Khách hàng tiềm năng
pound|[paʊnd]|n|đồng bảng Anh|L|A ten-pound note|Tờ mười bảng
pour|[pɔ:r]|v|rót|L|Pour some water|Rót một ít nước
powder|['paʊdər]|n|bột|L|Washing powder|Bột giặt
power|['paʊər]|n|sức mạnh|G|Wind power|Sức mạnh của gió
powerful|['paʊərfl]|adj|mạnh mẽ|G|A powerful engine|Một động cơ mạnh mẽ
practical|['præktıkl]|adj|thực tế|G|Practical advice|Lời khuyên thực tế
practice|['præktıs]|n|sự luyện tập|W|Need more practice|Cần luyện tập thêm
practise|['præktıs]|v|luyện tập|W|Practise piano|Luyện tập piano
praise|[preız]|v|khen ngợi|F|Praise a child|Khen ngợi một đứa trẻ
pray|[preı]|v|cầu nguyện|F|Pray for peace|Cầu nguyện cho hòa bình
prayer|['prer]|n|lời cầu nguyện|F|Say a prayer|Nói một lời cầu nguyện
predict|[prı'dıkt]|v|dự đoán|G|Predict the future|Dự đoán tương lai
prefer|[prı'fɜ:r]|v|thích hơn|F|Prefer tea to coffee|Thích trà hơn cà phê
pregnant|['pregnənt]|adj|mang thai|H|A pregnant woman|Một người phụ nữ mang thai
preparation|[,prepə'reıʃən]|n|sự chuẩn bị|W|Exam preparation|Sự chuẩn bị cho kỳ thi
prepare|[prı'per]|v|chuẩn bị|W|Prepare a meal|Chuẩn bị bữa ăn
presence|['prezns]|n|sự hiện diện|G|Your presence is requested|Sự hiện diện của bạn được yêu cầu
present|['preznt]|n|món quà|L|A birthday present|Một món quà sinh nhật
presentation|[,prezn'teıʃən]|n|bài thuyết trình|W|A good presentation|Một bài thuyết trình tốt
president|['prezıdənt]|n|tổng thống|W|The President|Ngài Tổng thống
press|[pres]|v|nhấn|G|Press the button|Nhấn nút
pressure|['preʃər]|n|áp lực|F|Under pressure|Dưới áp lực
pretend|[prı'tend]|v|giả vờ|G|Pretend to be asleep|Giả vờ ngủ
pretty|['prıti]|adj|xinh đẹp|F|A pretty girl|Một cô gái xinh đẹp
prevent|[prı'vent]|v|ngăn chặn|H|Prevent accidents|Ngăn chặn tai nạn
previous|['pri:viəs]|adj|trước đó|G|The previous day|Ngày hôm trước
previously|['pri:viəsli]|adv|trước đây|G|I previously worked there|Tôi trước đây từng làm ở đó
price|[praıs]|n|giá cả|L|A high price|Một mức giá cao
priest|[pri:st]|n|linh mục|W|A Catholic priest|Một linh mục Công giáo
primary|['praımeri]|adj|chính, tiểu học|W|Primary school|Trường tiểu học
prince|[prıns]|n|hoàng tử|E|A handsome prince|Một hoàng tử đẹp trai
princess|[prın'ses]|n|công chúa|E|A beautiful princess|Một cô công chúa xinh đẹp
principal|['prınsəpl]|n|hiệu trưởng|W|The school principal|Hiệu trưởng trường học
print|[prınt]|v|in ấn|W|Print a document|In một tài liệu
printer|['prıntər]|n|máy in|W|A laser printer|Một chiếc máy in laser
prior|['praıər]|adj|trước|G|Prior to the meeting|Trước cuộc họp
priority|[praı'ɔ:rəti]|n|sự ưu tiên|W|Top priority|Ưu tiên hàng đầu
prison|['prızn]|n|nhà tù|L|Go to prison|Đi tù
prisoner|['prıznər]|n|tù nhân|L|An escaped prisoner|Một tù nhân trốn thoát
private|['praıvət]|adj|riêng tư|G|Private life|Cuộc sống riêng tư
prize|[praız]|n|giải thưởng|E|First prize|Giải nhất
probably|['pra:bəbli]|adv|có lẽ|G|He is probably right|Anh ấy có lẽ đúng
problem|['pra:bləm]|n|vấn đề|G|No problem|Không có vấn đề gì
procedure|[prə'si:dʒər]|n|thủ tục|W|Standard procedure|Thủ tục tiêu chuẩn
process|['pra:ses]|n|quá trình|W|Learning process|Quá trình học tập
produce|[prə'du:s]|v|sản xuất|W|Produce food|Sản xuất thực phẩm
producer|[prə'du:sər]|n|nhà sản xuất|E|A movie producer|Một nhà sản xuất phim
product|['pra:dʌkt]|n|sản phẩm|W|New product|Sản phẩm mới
production|[prə'dʌkʃən]|n|sự sản xuất|W|Mass production|Sản xuất hàng loạt
profession|[prə'feʃən]|n|nghề nghiệp|W|Medical profession|Nghề y
professional|[prə'feʃənl]|adj|chuyên nghiệp|W|Professional skills|Kỹ năng chuyên nghiệp
professor|[prə'fesər]|n|giáo sư|W|A university professor|Một vị giáo sư đại học
profile|['proʊfaıl]|n|hồ sơ|W|Facebook profile|Hồ sơ Facebook
profit|['pra:fıt]|n|lợi nhuận|W|Make a profit|Tạo ra lợi nhuận
program|['proʊgræm]|n|chương trình|W|Computer program|Chương trình máy tính
programme|['proʊgræm]|n|chương trình|E|TV programme|Chương trình TV
progress|['pra:gres]|n|sự tiến bộ|W|Make progress|Đạt được tiến bộ
project|['pra:dʒekt]|n|dự án|W|A science project|Một dự án khoa học
promise|['pra:mıs]|v|hứa|G|I promise you|Tôi hứa với bạn
promote|[prə'moʊt]|v|thăng chức|W|Promote to manager|Thăng chức lên quản lý
pronounce|[prə'naʊns]|v|phát âm|W|Pronounce correctly|Phát âm chính xác
pronunciation|[prə,nʌnsi'eıʃən]|n|sự phát âm|W|English pronunciation|Sự phát âm tiếng Anh
proof|[pru:f]|n|bằng chứng|W|Show me the proof|Hãy cho tôi xem bằng chứng
proper|['pra:pər]|adj|thích hợp|G|Proper clothing|Quần áo thích hợp
properly|['pra:pərli]|adv|đúng cách|G|Do it properly|Làm điều đó đúng cách
property|['pra:pərti]|n|tài sản|L|Private property|Tài sản riêng
proportion|[prə'pɔ:rʃən]|n|tỷ lệ|G|A large proportion|Một tỷ lệ lớn
proposal|[prə'poʊzl]|n|lời đề nghị|W|Marriage proposal|Lời cầu hôn
propose|[prə'poʊz]|v|đề xuất|W|Propose a plan|Đề xuất một kế hoạch
prospect|['pra:spekt]|n|triển vọng|W|Job prospects|Triển vọng công việc
protect|[prə'tekt]|v|bảo vệ|G|Protect your skin|Bảo vệ làn da của bạn
protection|[prə'tekʃən]|n|sự bảo vệ|G|Need protection|Cần sự bảo vệ
protest|['proʊtest]|n|sự phản đối|W|A peaceful protest|Một cuộc biểu tình ôn hòa
proud|[praʊd]|adj|tự hào|F|I am proud of you|Tôi tự hào về bạn
prove|[pru:v]|v|chứng minh|W|Prove it|Chứng minh điều đó đi
provide|[prə'vaıd]|v|cung cấp|W|Provide food|Cung cấp thức ăn
pub|[pʌb]|n|quán rượu|E|Go to the pub|Đi đến quán rượu
public|['pʌblık]|adj|công cộng|G|Public transport|Giao thông công cộng
publication|[,pʌblı'keıʃən]|n|sự xuất bản|W|Scientific publication|Sự xuất bản khoa học
publish|['pʌblıʃ]|v|xuất bản|W|Publish a book|Xuất bản một cuốn sách
pull|[pʊl]|v|kéo|G|Pull the door|Kéo cánh cửa
pump|[pʌmp]|n|cái bơm|L|Water pump|Máy bơm nước
punch|[pʌntʃ]|v|đấm|G|Punch a bag|Đấm vào bao cát
punish|['pʌnıʃ]|v|trừng phạt|G|Punish the bad guy|Trừng phạt kẻ xấu
punishment|['pʌnıʃmənt]|n|sự trừng phạt|G|Deserve punishment|Xứng đáng bị trừng phạt
pupil|['pju:pl]|n|học sinh|W|A good pupil|Một học sinh ngoan
purchase|['pɜ:rtʃəs]|v|mua|L|Purchase a ticket|Mua một tấm vé
pure|[pjʊr]|adj|tinh khiết|G|Pure water|Nước tinh khiết
purple|['pɜ:rpl]|adj|màu tím|G|A purple flower|Một bông hoa màu tím
purpose|['pɜ:rpəs]|n|mục đích|G|On purpose|Cố tình
pursue|[pər'su:]|v|theo đuổi|W|Pursue a dream|Theo đuổi một giấc mơ
push|[pʊʃ]|v|đẩy|G|Push the button|Đẩy cái nút
put|[pʊt]|v|đặt, để|G|Put it here|Đặt nó ở đây
puzzle|['pʌzl]|n|câu đố|E|Solve a puzzle|Giải một câu đố
realize|['ri:əlaız]|v|nhận ra|G|Realize the truth|Nhận ra sự thật
receive|[rı'si:v]|v|nhận|G|Receive a letter|Nhận một lá thư
recently|['ri:sntli]|adv|gần đây|G|I met him recently|Tôi gặp anh ấy gần đây
reception|[rı'sepʃən]|n|tiếp đón|L|Wedding reception|Tiệc cưới
recipe|['resəpi]|n|công thức|L|A cake recipe|Công thức làm bánh
recognize|['rekəgnaız]|v|nhận ra|G|Recognize his face|Nhận ra khuôn mặt anh ấy
recommend|[,rekə'mend]|v|giới thiệu|G|Recommend a book|Giới thiệu một cuốn sách
record|['rekərd]|n|kỷ lục|E|World record|Kỷ lục thế giới
recording|[rı'kɔ:rdıŋ]|n|bản ghi|E|A voice recording|Bản ghi âm giọng nói
recycle|[ri:'saıkl]|v|tái chế|N|Recycle paper|Tái chế giấy
rest|[rest]|n|nghỉ ngơi|H|Take a rest|Nghỉ ngơi một chút
review|[rı'vju:]|n|đánh giá|W|Book review|Đánh giá sách
ride|[raıd]|n|chuyến đi|T|A bike ride|Chuyến đi xe đạp
ring|[rıŋ]|n|cái nhẫn|L|A diamond ring|Một chiếc nhẫn kim cương
rise|[raız]|v|tăng lên, mọc|N|The sun rises|Mặt trời mọc
rock|[ra:k]|n|đá|N|A big rock|Một tảng đá lớn
role|[roʊl]|n|vai trò|W|A leading role|Vai trò lãnh đạo
roof|[ru:f]|n|mái nhà|L|On the roof|Trên mái nhà
round|[raʊnd]|adj|tròn|G|A round table|Một chiếc bàn tròn
rubbish|['rʌbıʃ]|n|rác|L|Throw the rubbish|Vứt rác
rude|[ru:d]|adj|thô lỗ|F|Rude behavior|Hành vi thô lỗ
sauce|[sɔ:s]|n|nước sốt|L|Tomato sauce|Sốt cà chua
save|[seıv]|v|tiết kiệm, cứu|L|Save money|Tiết kiệm tiền
scared|[skerd]|adj|sợ hãi|F|I am scared|Tôi rất sợ
scary|['skeri]|adj|đáng sợ|F|A scary movie|Một bộ phim đáng sợ
scene|[si:n]|n|cảnh|E|A beautiful scene|Một cảnh đẹp
schedule|['skedʒu:l]|n|lịch trình|W|Busy schedule|Lịch trình bận rộn
score|[skɔ:r]|n|điểm số|E|High score|Điểm cao
screen|[skri:n]|n|màn hình|W|Touch screen|Màn hình cảm ứng
search|[sɜ:rtʃ]|v|tìm kiếm|G|Search the web|Tìm kiếm trên web
season|['si:zn]|n|mùa|N|Winter season|Mùa đông
seat|[si:t]|n|chỗ ngồi|L|Take a seat|Mời ngồi
second|['sekənd]|adj|thứ hai|G|Second floor|Tầng hai
secret|['si:krıt]|n|bí mật|F|Keep a secret|Giữ bí mật
secretary|['sekrəteri]|n|thư ký|W|Call the secretary|Gọi cho thư ký
seem|[si:m]|v|dường như|G|He seems happy|Anh ấy có vẻ hạnh phúc
sense|[sens]|n|giác quan|G|Make sense|Có ý nghĩa
separate|['seprət]|adj|riêng biệt|G|Separate rooms|Các phòng riêng biệt
series|['sıri:z]|n|chuỗi, loạt|E|A TV series|Một loạt phim truyền hình
serious|['sıriəs]|adj|nghiêm trọng|F|Serious problem|Vấn đề nghiêm trọng
serve|[sɜ:rv]|v|phục vụ|W|Serve food|Phục vụ thức ăn
service|['sɜ:rvıs]|n|dịch vụ|W|Good service|Dịch vụ tốt
several|['sevrəl]|det|một vài|G|Several days|Một vài ngày
shake|[ʃeık]|v|rung, lắc|G|Shake hands|Bắt tay
shall|[ʃæl]|modal|sẽ|G|Shall we go?|Chúng ta đi chứ?
shape|[ʃeıp]|n|hình dạng|G|A round shape|Một hình dạng tròn
sheet|[ʃi:t]|n|tấm, tờ|L|A sheet of paper|Một tờ giấy
shoulder|['ʃoʊldər]|n|vai|H|My shoulder hurts|Vai tôi bị đau
shout|[ʃaʊt]|v|hét lên|F|Don't shout|Đừng hét lên
shut|[ʃʌt]|v|đóng|G|Shut the door|Đóng cửa lại
side|[saıd]|n|bên|G|The right side|Phía bên phải
sign|[saın]|n|biển báo|G|A stop sign|Một biển báo dừng
silver|['sılvər]|n|bạc|L|A silver ring|Một chiếc nhẫn bạc
simple|['sımpl]|adj|đơn giản|G|A simple question|Một câu hỏi đơn giản
since|[sıns]|prep|kể từ khi|G|Since yesterday|Kể từ hôm qua
singing|['sıŋıŋ]|n|ca hát|E|I love singing|Tôi yêu ca hát
single|['sıŋgl]|adj|độc thân, đơn|G|A single man|Một người đàn ông độc thân
sir|[sɜ:r]|n|ngài|G|Yes, sir|Vâng, thưa ngài
site|[saıt]|n|địa điểm|W|Construction site|Công trường xây dựng
size|[saız]|n|kích thước|G|Shoe size|Kích thước giày
ski|[ski:]|v|trượt tuyết|E|Go skiing|Đi trượt tuyết
skin|[skın]|n|da|H|Sensitive skin|Làn da nhạy cảm
sky|[skaı]|n|bầu trời|N|Blue sky|Bầu trời xanh
sleep|[sli:p]|n|giấc ngủ|H|A good sleep|Một giấc ngủ ngon
slowly|['sloʊli]|adv|chậm chạp|G|Walk slowly|Đi chậm
smartphone|['sma:rtfoʊn]|n|điện thoại thông minh|L|Buy a smartphone|Mua điện thoại thông minh
smell|[smel]|v|ngửi|H|Smell the flowers|Ngửi hoa
smile|[smaıl]|v|cười|F|Smile at me|Hãy cười với tôi
smoke|[smoʊk]|n|khói|H|Cigarette smoke|Khói thuốc lá
soap|[soʊp]|n|xà phòng|L|Wash with soap|Rửa bằng xà phòng
soccer|['sa:kər]|n|bóng đá|E|Play soccer|Chơi bóng đá
social|['soʊʃəl]|adj|xã hội|G|Social media|Mạng xã hội
society|[sə'saıəti]|n|xã hội|G|Modern society|Xã hội hiện đại
sock|[sa:k]|n|đôi tất|L|A pair of socks|Một đôi tất
soft|[sɔ:ft]|adj|mềm mại|L|Soft pillow|Cái gối mềm
soldier|['soʊldʒər]|n|người lính|W|A brave soldier|Một người lính dũng cảm
solution|[sə'lu:ʃən]|n|giải pháp|W|Find a solution|Tìm một giải pháp
solve|[sa:lv]|v|giải quyết|W|Solve a problem|Giải quyết vấn đề
somewhere|['sʌmwer]|adv|đâu đó|G|Go somewhere|Đi đâu đó
sort|[sɔ:rt]|n|loại|G|What sort?|Loại gì?
source|[sɔ:rs]|n|nguồn|G|Source of water|Nguồn nước
speaker|['spi:kər]|n|loa, người nói|W|A loud speaker|Một cái loa to
specific|[spə'sıfık]|adj|cụ thể|G|Specific details|Chi tiết cụ thể
speech|[spi:tʃ]|n|bài phát biểu|W|Give a speech|Đưa ra bài phát biểu
speed|[spi:d]|n|tốc độ|T|High speed|Tốc độ cao
spider|['spaıdər]|n|con nhện|N|A big spider|Một con nhện lớn
spoon|[spu:n]|n|cái thìa|L|A silver spoon|Một cái thìa bạc
square|[skwer]|n|quảng trường|T|City square|Quảng trường thành phố
stage|[steıdʒ]|n|sân khấu|E|On the stage|Trên sân khấu
stair|[ster]|n|cầu thang|L|Walk up the stairs|Đi lên cầu thang
stamp|[stæmp]|n|con tem|L|A postage stamp|Một con tem bưu điện
star|[sta:r]|n|ngôi sao|N|A bright star|Một ngôi sao sáng
start|[sta:rt]|n|sự bắt đầu|G|A good start|Một sự khởi đầu tốt
state|[steıt]|n|bang|G|The State of Texas|Bang Texas
stay|[steı]|n|sự ở lại|T|A long stay|Một chuyến ở lại dài
steal|[sti:l]|v|ăn cắp|L|Steal money|Ăn cắp tiền
step|[step]|n|bước đi|G|Take a step|Thực hiện một bước
stone|[stoʊn]|n|hòn đá|N|A heavy stone|Một hòn đá nặng
store|[stɔ:r]|n|cửa hàng|L|Grocery store|Cửa hàng tạp hóa
straight|[streıt]|adv|thẳng|G|Go straight|Đi thẳng
strange|[streındʒ]|adj|kỳ lạ|G|A strange noise|Một tiếng ồn kỳ lạ
structure|['strʌktʃər]|n|cấu trúc|G|Building structure|Cấu trúc tòa nhà
stupid|['stu:pıd]|adj|ngu ngốc|F|Stupid mistake|Sai lầm ngu ngốc
succeed|[sək'si:d]|v|thành công|W|Succeed in life|Thành công trong cuộc sống
successful|[sək'sesfl]|adj|thành công|W|Successful business|Doanh nghiệp thành công
such|[sʌtʃ]|det|như vậy|G|Such a good day|Một ngày tốt đẹp như vậy
suddenly|['sʌdənli]|adv|đột nhiên|G|It suddenly rained|Đột nhiên trời mưa
suggest|[səg'dʒest]|v|đề xuất|G|Suggest an idea|Đề xuất một ý tưởng
suggestion|[səg'dʒestʃən]|n|gợi ý|G|A good suggestion|Một gợi ý tốt
suit|[su:t]|n|bộ com-lê|L|Wear a suit|Mặc một bộ đồ
support|[sə'pɔ:rt]|v|hỗ trợ|G|Support your team|Hỗ trợ đội của bạn
suppose|[sə'poʊz]|v|cho rằng|G|I suppose so|Tôi cho là vậy
sure|[ʃʊr]|adv|chắc chắn|G|Are you sure?|Bạn có chắc không?
surprise|[sər'praız]|n|sự ngạc nhiên|F|A big surprise|Một sự ngạc nhiên lớn
surprised|[sər'praızd]|adj|ngạc nhiên|F|I was surprised|Tôi đã rất ngạc nhiên
surprising|[sər'praızıŋ]|adj|đáng ngạc nhiên|F|Surprising news|Tin tức đáng ngạc nhiên
survey|['sɜ:rveı]|n|khảo sát|W|Online survey|Khảo sát trực tuyến
sweet|[swi:t]|adj|ngọt ngào|L|A sweet smile|Một nụ cười ngọt ngào
symbol|['sımbl]|n|biểu tượng|G|Peace symbol|Biểu tượng hòa bình
system|['sıstəm]|n|hệ thống|W|Computer system|Hệ thống máy tính
tablet|['tæblıt]|n|máy tính bảng|W|Read on a tablet|Đọc trên máy tính bảng
talk|[tɔ:k]|n|cuộc trò chuyện|G|Have a talk|Có một cuộc nói chuyện
target|['ta:rgıt]|n|mục tiêu|W|Target audience|Khán giả mục tiêu
task|[tæsk]|n|nhiệm vụ|W|Hard task|Nhiệm vụ khó khăn
taste|[teıst]|n|hương vị|L|A sweet taste|Một hương vị ngọt ngào
teaching|['ti:tʃıŋ]|n|việc dạy học|W|Love teaching|Yêu nghề dạy học
technology|[tek'na:lədʒi]|n|công nghệ|W|New technology|Công nghệ mới
teenage|['ti:neıdʒ]|adj|tuổi teen|L|Teenage boy|Cậu bé tuổi teen
temperature|['temprətʃər]|n|nhiệt độ|N|High temperature|Nhiệt độ cao
term|[tɜ:rm]|n|học kỳ|W|Spring term|Học kỳ mùa xuân
text|[tekst]|n|văn bản|W|Read the text|Đọc văn bản
themselves|[ðəm'selvz]|pron|chính họ|G|They did it themselves|Họ đã tự làm việc đó
thick|[θık]|adj|dày|G|A thick book|Một cuốn sách dày
thief|[θi:f]|n|kẻ trộm|L|Catch the thief|Bắt tên trộm
thin|[θın]|adj|mỏng|G|A thin jacket|Một chiếc áo khoác mỏng
thinking|['θıŋkıŋ]|n|sự suy nghĩ|G|Creative thinking|Suy nghĩ sáng tạo
third|[θɜ:rd]|n|thứ ba|G|The third floor|Tầng ba
thought|[θɔ:t]|n|suy nghĩ|G|A deep thought|Một suy nghĩ sâu sắc
throw|[θroʊ]|v|ném|G|Throw a ball|Ném một quả bóng
tidy|['taıdi]|adj|ngăn nắp|L|A tidy room|Một căn phòng gọn gàng
tie|[taı]|v|buộc|L|Tie your shoes|Buộc dây giày của bạn
tip|[tıp]|n|tiền boa, mẹo|L|Leave a tip|Để lại tiền boa
tool|[tu:l]|n|công cụ|W|A useful tool|Một công cụ hữu ích
top|[ta:p]|n|đỉnh|G|Top of the mountain|Đỉnh núi
touch|[tʌtʃ]|v|chạm|G|Don't touch|Đừng chạm vào
tour|[tʊr]|n|chuyến đi|T|City tour|Chuyến tham quan thành phố
towards|[tə'wɔ:rdz]|prep|hướng về|G|Walk towards me|Đi về phía tôi
tower|['taʊər]|n|tòa tháp|T|Eiffel Tower|Tháp Eiffel
toy|[tɔı]|n|đồ chơi|L|A new toy|Một món đồ chơi mới
track|[træk]|n|đường đua|E|Running track|Đường chạy
tradition|[trə'dıʃən]|n|truyền thống|E|Family tradition|Truyền thống gia đình
traditional|[trə'dıʃənl]|adj|truyền thống|E|Traditional food|Thức ăn truyền thống
trainer|['treınər]|n|huấn luyện viên|W|Fitness trainer|Huấn luyện viên thể hình
training|['treınıŋ]|n|đào tạo|W|Job training|Đào tạo công việc
transport|['trænspɔ:rt]|n|giao thông|T|Public transport|Giao thông công cộng
traveller|['trævələr]|n|khách du lịch|T|A tired traveller|Một du khách mệt mỏi
trouble|['trʌbl]|n|rắc rối|F|In trouble|Đang gặp rắc rối
truck|[trʌk]|n|xe tải|T|A big truck|Một chiếc xe tải lớn
twin|[twın]|n|sinh đôi|L|Twin brother|Anh em sinh đôi
typical|['tıpıkl]|adj|điển hình|G|Typical day|Ngày điển hình
underground|['ʌndərgraʊnd]|adj|dưới lòng đất|T|Underground train|Tàu điện ngầm
understanding|[,ʌndər'stændıŋ]|n|sự hiểu biết|G|Mutual understanding|Sự hiểu biết lẫn nhau
unfortunately|[ʌn'fɔ:rtʃənətli]|adv|không may|G|Unfortunately, he died|Thật không may, ông ấy đã mất
unhappy|[ʌn'hæpi]|adj|không hạnh phúc|F|Feel unhappy|Cảm thấy không hạnh phúc
uniform|['ju:nıfɔ:rm]|n|đồng phục|L|School uniform|Đồng phục học sinh
unit|['ju:nıt]|n|đơn vị|W|Unit of measurement|Đơn vị đo lường
united|[ju:'naıtıd]|adj|thống nhất|G|United team|Đội bóng đoàn kết
unusual|[ʌn'ju:ʒuəl]|adj|bất thường|G|Unusual animal|Con vật bất thường
upstairs|[,ʌp'sterz]|adv|trên lầu|L|Go upstairs|Đi lên lầu
use|[ju:s]|n|cách sử dụng|G|Good use|Sử dụng tốt
user|['ju:zər]|n|người dùng|W|Internet user|Người dùng Internet
usual|['ju:ʒuəl]|adj|thông thường|G|As usual|Như thường lệ
van|[væn]|n|xe tải nhỏ|T|A delivery van|Xe tải giao hàng
variety|[və'raıəti]|n|sự đa dạng|G|Variety of choices|Sự đa dạng của các lựa chọn
vehicle|['vi:əkl]|n|phương tiện|T|Electric vehicle|Phương tiện chạy điện
view|[vju:]|n|quang cảnh|T|A beautiful view|Một quang cảnh đẹp
virus|['vaırəs]|n|virus|H|Computer virus|Virus máy tính
voice|[vɔıs]|n|giọng nói|G|A loud voice|Một giọng nói lớn
wait|[weıt]|n|sự chờ đợi|G|A long wait|Một sự chờ đợi dài
war|[wɔ:r]|n|chiến tranh|G|World War II|Thế chiến II
wash|[wa:ʃ]|n|việc tắm rửa|L|A quick wash|Một lần tắm rửa nhanh chóng
wave|[weıv]|n|sóng|N|A big wave|Một cơn sóng lớn
weak|[wi:k]|adj|yếu|H|Feel weak|Cảm thấy yếu ớt
web|[web]|n|mạng lưới|W|The world wide web|Mạng lưới toàn cầu
wedding|['wedıŋ]|n|đám cưới|L|Wedding ring|Nhẫn cưới
weight|[weıt]|n|trọng lượng|H|Lose weight|Giảm cân
welcome|['welkəm]|n|sự chào đón|G|A warm welcome|Một sự chào đón nồng nhiệt
wet|[wet]|adj|ướt|N|Wet clothes|Quần áo ướt
wheel|[wi:l]|n|bánh xe|T|A broken wheel|Một bánh xe bị gãy
while|[waıl]|conj|trong khi|G|While I was sleeping|Trong khi tôi đang ngủ
whole|[hoʊl]|adj|toàn bộ|G|The whole world|Toàn thế giới
whose|[hu:z]|pron|của ai|G|Whose book is this?|Cuốn sách này của ai?
wide|[waıd]|adj|rộng|G|A wide road|Một con đường rộng
wild|[waıld]|adj|hoang dã|N|Wild animals|Động vật hoang dã
wind|[wınd]|n|gió|N|Strong wind|Gió mạnh
winner|['wınər]|n|người chiến thắng|E|The winner is...|Người chiến thắng là...
wish|[wıʃ]|v|ước muốn|F|Make a wish|Hãy ước một điều
wood|[wʊd]|n|gỗ|N|Made of wood|Làm bằng gỗ
working|['wɜ:rkıŋ]|adj|đang làm việc|W|Working hours|Giờ làm việc
worried|['wɜ:rid]|adj|lo lắng|F|Worried about exams|Lo lắng về kỳ thi
worry|['wɜ:ri]|v|lo lắng|F|Don't worry|Đừng lo lắng
worse|[wɜ:rs]|adj|tệ hơn|F|Get worse|Trở nên tệ hơn
worst|[wɜ:rst]|adj|tồi nhất|F|The worst day|Ngày tồi tệ nhất
wow|[waʊ]|exclam|trời ơi|F|Wow, it's huge!|Wow, nó thật khổng lồ!
yet|[jet]|adv|vẫn chưa|G|Not yet|Vẫn chưa
yours|[jʊrz]|pron|của bạn|G|It is yours|Nó là của bạn
zero|['zıroʊ]|n|số không|N|Below zero|Dưới độ không`.trim();

// Parse vocabulary using shared utility
const fullVocabulary = parseA2(rawString);

// Export for use by ExaminePage
export { fullVocabulary as a2Vocabulary };

const A2Vocabulary = () => {
  const [activeTab, setActiveTab] = useState('flashcard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState('All');
  const [currentFlashcard, setCurrentFlashcard] = useState(() => {
    const saved = localStorage.getItem('a2_flashcard_progress');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('a2_flashcard_progress', currentFlashcard);
  }, [currentFlashcard]);
  const [isFlipped, setIsFlipped] = useState(false);

  // AI Modal States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiCurrentWord, setAiCurrentWord] = useState(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [userSentence, setUserSentence] = useState('');
  const [isPronounceModalOpen, setIsPronounceModalOpen] = useState(false);

  const handleOpenAiModal = (wordObj) => {
    setAiCurrentWord(wordObj);
    setIsAiModalOpen(true);
    setAiResponse('');
    setUserSentence('');
    handleExplainWord(wordObj);
  };

  const handleOpenPronounce = (item) => {
    setAiCurrentWord(item);
    setIsPronounceModalOpen(true);
  };

  const handleExplainWord = async (wordObj) => {
    setIsAiLoading(true);
    const prompt = `Hãy giải thích chi tiết cách sử dụng từ tiếng Anh "${wordObj.word}" (từ loại: ${wordObj.pos}, nghĩa: ${wordObj.meaning}). Cung cấp 2 ví dụ thực tế kèm lời dịch, và chỉ ra các sắc thái nghĩa hoặc lỗi sai thường gặp khi dùng từ này ở trình độ A2. Trình bày ngắn gọn, dễ hiểu.`;
    const response = await callAI(prompt);
    setAiResponse(response);
    setIsAiLoading(false);
  };

  const handleCheckSentence = async () => {
    if (!userSentence.trim()) return;
    setIsAiLoading(true);
    const prompt = `Tôi đang học từ tiếng Anh "${aiCurrentWord.word}". Đánh giá câu sau của tôi: "${userSentence}". Hãy chỉ ra lỗi ngữ pháp hoặc cách dùng từ (nếu có), giải thích lý do, và đề xuất 1-2 cách viết tự nhiên hơn. Trình bày ngắn gọn, thân thiện.`;
    const response = await callAI(prompt);
    setAiResponse(response);
    setIsAiLoading(false);
  };

  // Trạng thái từ đã học
  const [showLearned, setShowLearned] = useState(false);
  const [learnedWords, setLearnedWords] = useState(() => {
    const saved = localStorage.getItem('a2_learned_words');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('a2_learned_words', JSON.stringify(learnedWords));
  }, [learnedWords]);

  const toggleLearned = (word) => {
    setLearnedWords(prev => {
      const isRemoving = prev.includes(word);
      if (isRemoving) {
        playSound('click');
        return prev.filter(w => w !== word);
      } else {
        playSound('success');
        return [...prev, word];
      }
    });
  };

  // Danh mục Topic
  const topicConfig = {
    'All': { label: 'Tất cả', icon: <LayoutGrid className="w-4 h-4" />, color: 'bg-indigo-600' },
    'Travel': { label: 'Du lịch', icon: <Plane className="w-4 h-4" />, color: 'bg-blue-500' },
    'Health': { label: 'Sức khỏe', icon: <Heart className="w-4 h-4" />, color: 'bg-red-500' },
    'Work & Edu': { label: 'Học & Làm', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-amber-600' },
    'Nature': { label: 'Thiên nhiên', icon: <Leaf className="w-4 h-4" />, color: 'bg-emerald-600' },
    'Leisure': { label: 'Giải trí', icon: <Music className="w-4 h-4" />, color: 'bg-purple-600' },
    'Life': { label: 'Đời sống', icon: <Home className="w-4 h-4" />, color: 'bg-sky-600' },
    'Feelings': { label: 'Cảm xúc', icon: <Smile className="w-4 h-4" />, color: 'bg-pink-600' },
    'General': { label: 'Tổng hợp', icon: <Tags className="w-4 h-4" />, color: 'bg-slate-500' },
  };

  const topics = Object.keys(topicConfig);

  const [shuffledFlashcards, setShuffledFlashcards] = useState([]);

  // Lọc từ vựng theo tìm kiếm và Topic
  const filteredVocab = useMemo(() => {
    return fullVocabulary.filter(item => {
      const matchesSearch = item.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTopic = filterTopic === 'All' || item.topic === filterTopic;
      const matchesLearned = showLearned || !learnedWords.includes(item.word);
      return matchesSearch && matchesTopic && matchesLearned;
    });
  }, [searchQuery, filterTopic, learnedWords, showLearned]);



  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Đảm bảo chỉ số flashcard luôn nằm trong phạm vi hợp lệ
  useEffect(() => {
    if (filteredVocab.length > 0 && currentFlashcard >= filteredVocab.length) {
      setCurrentFlashcard(filteredVocab.length - 1);
    }
  }, [filteredVocab.length, currentFlashcard]);

  return (
    <div className="bg-white text-slate-900 font-sans pb-10">



      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-10">
        <div className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" placeholder="Tìm kiếm theo từ tiếng Anh hoặc nghĩa tiếng Việt..." 
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none shadow-sm transition-all"
                value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentFlashcard(0); }}
              />
            </div>
            
            <button 
              onClick={() => { setShowLearned(!showLearned); setCurrentFlashcard(0); }}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all border ${showLearned ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {showLearned ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              {showLearned ? 'Đang hiện từ đã học' : 'Đang ẩn từ đã học'}
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
            {topics.map(topic => (
              <button 
                key={topic} 
                onClick={() => {
                  setFilterTopic(topic);
                  setCurrentFlashcard(0); 
                  playSound('select');
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap shadow-sm border ${filterTopic === topic ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                {topicConfig[topic].icon}
                {topicConfig[topic].label}
              </button>
            ))}
          </div>
        </div>

        {filteredVocab.length > 0 && (
          <div className="flex flex-col items-center py-12 space-y-10">
            <div className="bg-indigo-100 text-indigo-700 px-6 py-2 rounded-full text-sm font-black shadow-sm ring-4 ring-white">
              TỪ {currentFlashcard + 1} TRÊN {filteredVocab.length}
            </div>

            <div 
              className={`relative w-full max-w-[min(384px,calc(100vw-2rem))] h-[400px] cursor-pointer transition-all duration-700 preserve-3d group ${isFlipped ? 'rotate-y-180' : ''}`}
              onClick={() => { setIsFlipped(!isFlipped); playSound('click'); }}
              style={{ perspective: '1200px' }}
            >
              <div className={`absolute inset-0 bg-white rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-10 border-4 border-white ring-1 ring-slate-100 backface-hidden ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white mb-6 ${topicConfig[filteredVocab[currentFlashcard].topic].color}`}>
                   {topicConfig[filteredVocab[currentFlashcard].topic].icon}
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 capitalize mb-4 tracking-tighter text-center break-words px-4 leading-tight">{filteredVocab[currentFlashcard].word}</h2>
                <p className="text-slate-400 text-2xl font-medium tracking-wide">{filteredVocab[currentFlashcard].ipa}</p>
                <div className="mt-16 flex items-center gap-3 text-slate-300 text-xs font-black uppercase tracking-[0.2em]">
                  <Play className="w-4 h-4" /> Chạm để lật thẻ
                </div>
              </div>

              <div 
                className={`absolute inset-0 bg-indigo-600 rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-10 text-white backface-hidden transform rotate-y-180 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}
                style={{ transform: 'rotateY(180deg)' }}
              >
                <span className="text-indigo-200 text-xs font-black uppercase mb-4 tracking-widest">{topicConfig[filteredVocab[currentFlashcard].topic].label}</span>
                <h3 className="text-3xl font-black mb-8 text-center leading-tight underline decoration-indigo-400 underline-offset-8">{filteredVocab[currentFlashcard].meaning}</h3>
                <div className="w-full h-px bg-white/20 mb-8"></div>
                <p className="italic text-indigo-50 text-lg text-center mb-4 font-medium px-4 leading-relaxed">"{filteredVocab[currentFlashcard].example}"</p>
                <p className="text-xs text-indigo-300 text-center font-bold tracking-wider uppercase opacity-80">{filteredVocab[currentFlashcard].translation}</p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-6 items-center flex-wrap justify-center">
              <button 
                disabled={currentFlashcard === 0} 
                onClick={() => { setCurrentFlashcard(prev => prev - 1); setIsFlipped(false); playSound('click'); }} 
                className="p-4 sm:p-5 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-500 disabled:opacity-30 transition-all shadow-lg active:scale-95"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
              <button 
                onClick={() => speak(filteredVocab[currentFlashcard].word)} 
                className="p-4 sm:p-5 rounded-full bg-white border border-slate-200 text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all shadow-lg active:scale-95"
                title="Nghe"
              >
                <Volume2 className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
              <button 
                onClick={() => handleOpenPronounce(filteredVocab[currentFlashcard])}
                className={`px-6 sm:px-8 py-4 sm:py-5 rounded-full font-black shadow-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 ring-4 sm:ring-8 bg-rose-600 text-white hover:bg-rose-700 ring-rose-50`}
              >
                <Mic className="w-5 h-5 sm:w-6 sm:h-6" /> PHÁT ÂM
              </button>
              <button 
                onClick={() => handleOpenAiModal(filteredVocab[currentFlashcard])}
                className="p-4 sm:p-5 rounded-full bg-white border border-slate-200 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-lg active:scale-95"
                title="Hỏi AI"
              >
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
              <button 
                disabled={currentFlashcard === filteredVocab.length - 1} 
                onClick={() => { setCurrentFlashcard(prev => prev + 1); setIsFlipped(false); playSound('click'); }} 
                className="p-4 sm:p-5 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-500 disabled:opacity-30 transition-all shadow-lg active:scale-95"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </div>


          </div>
        )}

      </main>

      <AiAssistantModal 
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        wordObj={aiCurrentWord}
        onExplain={handleExplainWord}
        onCheckSentence={handleCheckSentence}
        aiResponse={aiResponse}
        isAiLoading={isAiLoading}
        userSentence={userSentence}
        setUserSentence={setUserSentence}
        themeColor="indigo"
      />

      <PronunciationModal 
        isOpen={isPronounceModalOpen}
        onClose={() => setIsPronounceModalOpen(false)}
        wordObj={aiCurrentWord}
        themeColor="indigo"
      />

      <footer className="max-w-6xl mx-auto px-6 py-10 text-center text-slate-300">
        <div className="flex items-center justify-center gap-2 font-black tracking-widest uppercase text-xs">
          <BookOpen className="w-4 h-4" />
          A2 Level Vocabulary • AI Assistant
        </div>
      </footer>
    </div>
  );
};

export default A2Vocabulary;