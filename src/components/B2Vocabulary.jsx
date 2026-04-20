import React, { useState, useEffect, useMemo, useRef } from 'react';
import { playSound } from '../utils/sounds';
import { 
  Search, Volume2, BookOpen,
  ChevronLeft, ChevronRight, Play, 
  Tags, LayoutGrid, Heart, Plane, GraduationCap, 
  Leaf, Music, Home, Smile, Filter, Sparkles,
  Eye, EyeOff, Mic, CheckCircle
} from 'lucide-react';
import { callAI, callAIStream } from '../utils/openai';
import { parseB1B2, topicLabels, topicColors } from '../utils/vocabularyData';
import PronunciationModal from './common/PronunciationModal';
import AiAssistantModal from './common/AiAssistantModal';
import FilterModal from './common/FilterModal';

/* * KỸ THUẬT SIÊU NÉN DỮ LIỆU (STRING COMPRESSION) CHO B2
 * Định dạng: word|ipa|pos|meaning|topic_code|example|translation|synonyms|collocations
 * Mã Topic: T (Travel), H (Health), W (Work & Edu), N (Nature), E (Leisure), L (Life), F (Feelings), G (General)
 */
const rawString = `absolutely|/'æbsə,lu:tli/|adv|hoàn toàn|G|She is absolutely certain.|Cô ấy hoàn toàn chắc chắn.|completely, totally|absolutely necessary, absolutely right
academic|/ækə'demık/|adj|học thuật|W|The academic year starts in September.|Năm học bắt đầu vào tháng Chín.|educational, scholastic|academic year, academic performance
access|/'ækses/|n|truy cập|W|You need a password to access.|Bạn cần mật khẩu để truy cập.|entry, admission|gain access, internet access
accommodation|/ə,ka:mə'deıʃən/|n|chỗ ở|T|Find accommodation near the beach.|Tìm chỗ ở gần bãi biển.|housing, lodging|find accommodation, book accommodation
account|/ə'kaʊnt/|n|tài khoản|W|I have a bank account.|Tôi có một tài khoản ngân hàng.|profile, record|bank account, create an account
achievement|/ə'tʃi:vmənt/|n|thành tựu|W|Winning the award was a great achievement.|Đoạt giải là một thành tựu lớn.|success, accomplishment|great achievement, outstanding achievement
act|/ækt/|n|hành động|G|An act of kindness.|Một hành động tử tế.|action, deed|act of kindness, catch in the act
ad|/æd/|n|quảng cáo|W|I saw an ad on TV.|Tôi đã thấy một quảng cáo trên TV.|advertisement, commercial|put an ad, TV ad
addition|/ə'dıʃən/|n|sự thêm vào|G|In addition to the main course.|Ngoài món chính ra.|supplement, inclusion|in addition to, a new addition
admire|/əd'maıər/|v|ngưỡng mộ|F|I admire her dedication.|Tôi ngưỡng mộ sự cống hiến của cô ấy.|respect, look up to|admire greatly, secretly admire
admit|/əd'mıt/|v|thừa nhận|G|He admitted his mistake.|Anh ấy đã thừa nhận sai lầm của mình.|confess, acknowledge|admit defeat, freely admit
advanced|/əd'vænst/|adj|tiên tiến|W|For advanced students only.|Chỉ dành cho học viên nâng cao.|developed, progressive|advanced technology, advanced level
advise|/əd'vaız/|v|khuyên|W|She advised him to see a doctor.|Cô ấy khuyên anh ta đi gặp bác sĩ.|counsel, recommend|strongly advise, advise against
afford|/ə'fɔ:rd/|v|đủ khả năng|L|They can't afford a new car.|Họ không đủ khả năng mua xe mới.|manage, bear|afford to buy, can ill afford
age|/eıdʒ/|v|già đi|L|People age at different rates.|Con người già đi ở tốc độ khác nhau.|grow old, mature|age quickly, age gracefully
aged|/eıdʒd/|adj|lớn tuổi|L|He takes care of his aged parents.|Anh ấy chăm sóc cha mẹ lớn tuổi.|elderly, old|aged parents, middle-aged
agent|/'eıdʒənt/|n|đại lý|W|A real estate agent.|Đại lý bất động sản.|representative, broker|travel agent, secret agent
agreement|/ə'gri:mənt/|n|thỏa thuận|W|They signed an agreement.|Họ đã ký một thỏa thuận.|contract, settlement|reach an agreement, sign an agreement
ahead|/ə'hed/|adv|phía trước|G|There is a gas station ahead.|Có một trạm xăng phía trước.|forward, in front|go ahead, look ahead
aim|/eım/|n|mục đích|W|Our aim is to improve.|Mục đích của chúng tôi là cải thiện.|goal, target|main aim, achieve an aim
alarm|/ə'la:rm/|n|báo động|L|The smoke alarm went off.|Báo động khói đã reo.|siren, warning|set the alarm, fire alarm
album|/'ælbəm/|n|album|E|She released a new album.|Cô ấy phát hành album mới.|record, collection|release an album, debut album
alcohol|/'ælkə,ha:l/|n|rượu|L|He does not drink alcohol.|Anh ấy không uống rượu.|liquor, spirits|consume alcohol, alcohol abuse
alcoholic|/,ælkə'ha:lık/|adj|nghiện rượu|H|Recovering from being an alcoholic.|Hồi phục sau khi nghiện rượu.|intoxicating, strong|alcoholic drink, recovering alcoholic
alternative|/ɔ:l'tɜ:rnətıv/|adj|thay thế|G|Alternative solutions.|Các giải pháp thay thế.|substitute, other|alternative energy, viable alternative
amazed|/ə'meızd/|adj|kinh ngạc|F|She was amazed by the tricks.|Cô ấy kinh ngạc trước những mánh khóe.|astonished, surprised|absolutely amazed, amazed at/by
ambition|/æm'bıʃən/|n|tham vọng|F|His ambition is to be famous.|Tham vọng của anh ấy là nổi tiếng.|aspiration, desire|lifelong ambition, fulfill an ambition
ambitious|/æm'bıʃəs/|adj|tham vọng|F|She is very ambitious.|Cô ấy rất tham vọng.|driven, determined|highly ambitious, ambitious plan
analyse|/'ænə,laız/|v|phân tích|W|Analyse the data.|Phân tích dữ liệu.|examine, study|analyse carefully, analyse data
analysis|/ə'næləsıs/|n|phân tích|W|The analysis took several days.|Việc phân tích mất vài ngày.|examination, evaluation|detailed analysis, data analysis
announce|/ə'naʊns/|v|thông báo|W|Announce the new policy.|Thông báo chính sách mới.|declare, proclaim|officially announce, proudly announce
announcement|/ə'naʊnsmənt/|n|thông báo|W|An announcement about the event.|Một thông báo về sự kiện.|declaration, statement|make an announcement, public announcement
annoy|/ə'nɔı/|v|làm phiền|F|His music annoyed the neighbors.|Âm nhạc của anh ấy làm phiền hàng xóm.|irritate, bother|annoy someone, start to annoy
annoyed|/ə'nɔıd/|adj|khó chịu|F|She was annoyed by the noise.|Cô ấy khó chịu vì tiếng ồn.|irritated, angry|feel annoyed, slightly annoyed
annoying|/ə'nɔııŋ/|adj|phiền phức|F|The sound is really annoying.|Âm thanh thật sự phiền phức.|irritating, bothersome|really annoying, annoying habit
apart|/ə'pa:rt/|adv|riêng biệt|G|They live apart.|Họ sống riêng biệt.|separately, isolated|fall apart, take apart
apologize|/ə'pa:lə,dʒaız/|v|xin lỗi|F|He apologized for being late.|Anh ấy xin lỗi vì đến muộn.|say sorry, express regret|sincerely apologize, apologize for
application|/,æplı'keıʃən/|n|ứng dụng, đơn|W|I submitted my application.|Tôi đã nộp đơn.|form, software|job application, fill in an application
appointment|/ə'pɔıntmənt/|n|cuộc hẹn|W|A doctor's appointment.|Một cuộc hẹn với bác sĩ.|meeting, arrangement|book an appointment, dental appointment
appreciate|/ə'pri:ʃi,eıt/|v|đánh giá cao|F|I appreciate your help.|Tôi đánh giá cao sự giúp đỡ của bạn.|value, respect|highly appreciate, fully appreciate
approximately|/ə'pra:ksımətli/|adv|khoảng chừng|G|Approximately three hours.|Khoảng chừng ba giờ.|roughly, about|approximately equal, cost approximately
arrest|/ə'rest/|v|bắt giữ|L|The police arrested the suspect.|Cảnh sát đã bắt giữ nghi phạm.|capture, detain|under arrest, arrest a suspect
arrival|/ə'raıvəl/|n|sự đến|T|The arrival of the train.|Sự đến của đoàn tàu.|appearance, coming|early arrival, arrival time
assignment|/ə'saınmənt/|n|nhiệm vụ|W|The teacher gave an assignment.|Giáo viên giao một nhiệm vụ.|task, project|complete an assignment, homework assignment
assist|/ə'sıst/|v|hỗ trợ|W|Can you assist me?|Bạn có thể hỗ trợ tôi không?|help, aid|assist in/with, actively assist
atmosphere|/'ætmə,sfır/|n|bầu không khí|G|The atmosphere was lively.|Bầu không khí rất sôi động.|air, mood|relaxed atmosphere, earth's atmosphere
attach|/ə'tætʃ/|v|đính kèm|W|Attach the document.|Đính kèm tài liệu.|join, connect|attach a file, attach importance to
attitude|/'ætə,tu:d/|n|thái độ|F|A positive attitude.|Một thái độ tích cực.|mindset, approach|positive attitude, change one's attitude
attract|/ə'trækt/|v|thu hút|G|The flowers attract bees.|Những bông hoa thu hút ong.|draw, appeal to|attract attention, strongly attract
attraction|/ə'trækʃən/|n|sự thu hút|T|Tourist attractions.|Những điểm thu hút khách du lịch.|appeal, draw|tourist attraction, fatal attraction
authority|/ə'θɔ:rəti/|n|quyền lực|W|The authority to make decisions.|Quyền lực đưa ra quyết định.|power, control|have the authority, local authority
average|/'ævərıdʒ/|v|trung bình|G|She averages eight hours of sleep.|Cô ấy trung bình ngủ tám giờ.|mean, standard|above average, average age
award|/ə'wɔ:rd/|v|trao thưởng|E|Awarded a prize.|Được trao thưởng một giải.|grant, present|win an award, present an award
aware|/ə'wer/|adj|nhận thức|G|Are you aware of the risks?|Bạn có nhận thức được rủi ro không?|conscious, mindful|fully aware, become aware
backwards|/'bækwərdz/|adv|ngược|G|He took a step backwards.|Anh ấy lùi một bước.|in reverse, rearward|step backwards, look backwards
bake|/beık/|v|nướng|L|Bake cookies on weekends.|Nướng bánh quy vào cuối tuần.|roast, cook|bake a cake, freshly baked
balance|/'bæləns/|n|cân bằng|G|Maintain a balance.|Duy trì sự cân bằng.|equilibrium, stability|lose balance, strike a balance
ban|/bæn/|v|cấm|W|The city banned smoking.|Thành phố đã cấm hút thuốc.|prohibit, forbid|impose a ban, strictly banned
bank|/bæŋk/|n|bờ sông|N|On the bank of the river.|Trên bờ sông.|shore, edge|river bank, steep bank
base|/beıs/|n|cơ sở|W|The main base is in NY.|Cơ sở chính ở NY.|foundation, core|military base, customer base
basic|/'beısık/|adj|cơ bản|G|A basic understanding.|Một hiểu biết cơ bản.|fundamental, primary|basic needs, basic skills
basis|/'beısıs/|n|nền tảng|G|The basis of a relationship.|Nền tảng của một mối quan hệ.|foundation, base|on a daily basis, form the basis
battery|/'bætəri/|n|pin|L|My phone's battery is dead.|Pin điện thoại của tôi đã hết.|cell, power|recharge the battery, dead battery
battle|/'bætəl/|n|trận chiến|G|The battle lasted three days.|Trận chiến kéo dài ba ngày.|fight, conflict|fight a battle, lose a battle
beauty|/'bju:ti/|n|vẻ đẹp|G|The beauty of the landscape.|Vẻ đẹp của phong cảnh.|attractiveness, charm|natural beauty, outstanding beauty
bee|/bi:/|n|con ong|N|The bee is collecting nectar.|Con ong đang hút mật.|insect, pollinator|busy as a bee, bee sting
belief|/bı'li:f/|n|niềm tin|F|A strong belief.|Một niềm tin mạnh mẽ.|faith, conviction|strong belief, religious belief
bell|/bel/|n|cái chuông|L|The school bell rang.|Chuông trường đã reo.|chime, alarm|ring a bell, alarm bell
bend|/bend/|v|uốn cong|G|Bend her body.|Uốn cong cơ thể cô ấy.|curve, flex|bend down, sharp bend
benefit|/'benıfıt/|v|có lợi|G|Exercise benefits your health.|Tập thể dục có lợi cho sức khỏe.|profit, help|mutual benefit, reap the benefits
better|/'betər/|n|tốt hơn|G|This plan is better.|Kế hoạch này tốt hơn.|superior, finer|get better, much better
bite|/baıt/|v|cắn|G|The dog bit him.|Con chó đã cắn anh ta.|chew, nip|take a bite, dog bite
block|/bla:k/|v|chặn|G|The road is blocked.|Con đường bị chặn.|obstruct, hinder|block the way, apartment block
board|/bɔ:rd/|v|lên tàu|T|Boarded the plane.|Đã lên máy bay.|get on, enter|board a flight, bulletin board
bomb|/ba:m/|n|bom|G|The building was bombed.|Tòa nhà đã bị đánh bom.|explosive, weapon|plant a bomb, bomb explosion
border|/'bɔ:rdər/|n|biên giới|T|Share a long border.|Chia sẻ một đường biên giới dài.|boundary, frontier|cross the border, border control
bother|/'ba:ðər/|v|làm phiền|F|I don't want to bother you.|Tôi không muốn làm phiền bạn.|annoy, disturb|bother someone, not bother to
branch|/bræntʃ/|n|chi nhánh|W|Bank branches.|Các chi nhánh ngân hàng.|office, department|local branch, tree branch
brand|/brænd/|n|nhãn hiệu|W|A new brand of shoes.|Một nhãn hiệu giày mới.|make, label|top brand, brand new
brave|/breıv/|adj|dũng cảm|F|The brave firefighter.|Người lính cứu hỏa dũng cảm.|courageous, fearless|brave soldier, very brave
breath|/breθ/|n|hơi thở|H|Take a deep breath.|Hít một hơi thật sâu.|inhalation, gasp|deep breath, out of breath
breathe|/bri:ð/|v|hít thở|H|Breathed heavily.|Thở nặng nhọc.|inhale, exhale|breathe deeply, breathe in
breathing|/'bri:ðıŋ/|n|sự hít thở|H|Her breathing was slow.|Sự hít thở của cô ấy chậm.|respiration, breathing in|heavy breathing, stop breathing
bride|/braıd/|n|cô dâu|L|The beautiful bride.|Cô dâu xinh đẹp.|newlywed, wife|beautiful bride, bride and groom
bubble|/'bʌbəl/|n|bong bóng|E|Soap bubbles.|Bong bóng xà phòng.|foam, froth|blow bubbles, soap bubble
bury|/'beri/|v|chôn|G|Buried the capsule.|Đã chôn viên nang.|hide, conceal|bury the dead, bury a secret
calm|/ka:m/|adj|bình tĩnh|F|Stay calm.|Giữ bình tĩnh.|peaceful, relaxed|stay calm, keep calm
campaign|/kæm'peın/|n|chiến dịch|W|Launched a campaign.|Phát động một chiến dịch.|drive, movement|political campaign, launch a campaign
campus|/'kæmpəs/|n|khuôn viên trường|W|The university campus.|Khuôn viên trường đại học.|grounds, college|university campus, on campus
candidate|/'kændıdeıt/|n|ứng cử viên|W|Candidate for the job.|Ứng cử viên cho công việc.|applicant, nominee|ideal candidate, presidential candidate
cap|/kæp/|n|mũ|L|Wore a baseball cap.|Đội một chiếc mũ bóng chày.|hat, cover|baseball cap, bottle cap
captain|/'kæptın/|n|đội trưởng|E|The captain of the team.|Đội trưởng của đội.|leader, commander|team captain, ship captain
careless|/'kerləs/|adj|bất cẩn|F|Careless mistake.|Sai lầm bất cẩn.|reckless, irresponsible|careless driving, careless mistake
category|/'kætəgɔ:ri/|n|hạng, loại|G|Fiction category.|Thể loại tiểu thuyết.|class, group|fall into a category, broad category
ceiling|/'si:lıŋ/|n|trần nhà|L|The ceiling of the room.|Trần nhà của căn phòng.|roof, top|high ceiling, hit the ceiling
celebration|/,selı'breıʃən/|n|kỷ niệm|E|A big celebration.|Một lễ kỷ niệm lớn.|party, festival|birthday celebration, hold a celebration
central|/'sentrəl/|adj|trung tâm|G|The central park.|Công viên trung tâm.|middle, main|central location, central idea
centre|/'sentər/|v|tập trung|G|Centred around the policy.|Tập trung vào chính sách.|focus, concentrate|centre of attention, shopping centre
ceremony|/'serəməni/|n|buổi lễ|L|Graduation ceremony.|Buổi lễ tốt nghiệp.|ritual, event|wedding ceremony, award ceremony
chain|/tʃeın/|n|chuỗi, dây xích|L|A gold chain.|Một sợi dây xích vàng.|series, sequence|gold chain, chain reaction
challenge|/'tʃælındʒ/|n|thách thức|W|A big challenge.|Một thách thức lớn.|test, difficulty|face a challenge, accept a challenge
champion|/'tʃæmpiən/|n|nhà vô địch|E|Tennis champion.|Nhà vô địch quần vợt.|winner, titleholder|world champion, defending champion
channel|/'tʃænəl/|n|kênh|E|TV channel.|Kênh truyền hình.|station, network|change the channel, YouTube channel
chapter|/'tʃæptər/|n|chương|W|The final chapter.|Chương cuối cùng.|section, part|first chapter, chapter of a book
charge|/tʃa:rdʒ/|v|tính phí|W|Charged a fee.|Tính một khoản phí.|bill, demand|free of charge, in charge of
cheap|/tʃi:p/|adv|rẻ|L|Sells clothes very cheap.|Bán quần áo rất rẻ.|inexpensive, low-cost|dirt cheap, cheap flights
cheat|/tʃi:t/|v|gian lận|G|Cheating on the exam.|Gian lận trong kỳ thi.|deceive, trick|cheat on a test, cheat death
cheerful|/'tʃırfəl/|adj|vui vẻ|F|A cheerful attitude.|Một thái độ vui vẻ.|happy, joyful|cheerful smile, cheerful voice
chemical|/'kemıkəl/|n|hóa chất|W|Chemical reactions.|Phản ứng hóa học.|substance, compound|chemical reaction, toxic chemical
chest|/tʃest/|n|ngực|H|Pain in his chest.|Đau ở ngực.|breast, upper body|chest pain, treasure chest
childhood|/'tʃaıldhʊd/|n|thời thơ ấu|L|A happy childhood.|Một thời thơ ấu hạnh phúc.|youth, early years|happy childhood, childhood memories
claim|/kleım/|v|tuyên bố|G|Claimed he was innocent.|Tuyên bố anh ta vô tội.|assert, declare|claim responsibility, false claim
clause|/klɔ:z/|n|mệnh đề|W|A confidentiality clause.|Một điều khoản bảo mật.|section, paragraph|main clause, contract clause
clear|/klır/|v|làm rõ|G|Clear the table.|Dọn bàn.|clean, clarify|crystal clear, make it clear
click|/klık/|v|nhấp chuột|W|Click on the link.|Nhấp vào liên kết.|tap, press|click a button, right click
client|/'klaıənt/|n|khách hàng|W|Met with her client.|Gặp khách hàng của cô ấy.|customer, consumer|potential client, corporate client
climb|/klaım/|n|leo trèo|E|Climb to the top.|Leo lên đỉnh.|ascend, go up|climb a mountain, steep climb
close|/kloʊz/|adv|gần|G|Close to my house.|Gần nhà tôi.|near, nearby|close together, stay close
cloth|/klɔ:θ/|n|vải|L|A piece of cloth.|Một mảnh vải.|fabric, material|damp cloth, cotton cloth
clue|/klu:/|n|manh mối|W|Found a clue.|Tìm thấy một manh mối.|hint, evidence|vital clue, no clue
coach|/koʊtʃ/|v|huấn luyện|E|Coaches the football team.|Huấn luyện đội bóng đá.|train, instruct|head coach, bus coach
coal|/koʊl/|n|than đá|N|Use a lot of coal.|Sử dụng nhiều than đá.|mineral, fuel|coal mine, burn coal
coin|/kɔın/|n|đồng xu|L|Dropped a coin.|Làm rơi một đồng xu.|change, currency|gold coin, flip a coin
collection|/kə'lekʃən/|n|bộ sưu tập|E|Collection of rare stamps.|Bộ sưu tập tem hiếm.|accumulation, group|private collection, stamp collection
coloured|/'kʌlərd/|adj|có màu|G|Coloured lights.|Những bóng đèn màu.|tinted, dyed|brightly coloured, multi-coloured
combine|/kəm'baın/|v|kết hợp|G|Combine all ingredients.|Kết hợp tất cả nguyên liệu.|mix, merge|combine forces, combine with
comment|/'ka:ment/|v|bình luận|G|Commented on the beauty.|Đã bình luận về vẻ đẹp.|remark, express|leave a comment, no comment
commercial|/kə'mɜ:rʃəl/|n|thương mại|W|The commercial aired.|Quảng cáo thương mại đã phát sóng.|advertisement, ad|commercial break, TV commercial
commit|/kə'mıt/|v|cam kết|W|Committed to finishing.|Đã cam kết hoàn thành.|dedicate, pledge|commit a crime, fully commit
communication|/kə,mju:nı'keıʃən/|n|giao tiếp|W|Good communication.|Giao tiếp tốt.|interaction, contact|effective communication, communication skills
comparison|/kəm'pærısən/|n|so sánh|G|The comparison was clear.|Sự so sánh rất rõ ràng.|contrast, evaluating|in comparison with, draw a comparison
competitor|/kəm'petıtər/|n|đối thủ|W|Many competitors.|Nhiều đối thủ cạnh tranh.|rival, opponent|main competitor, fierce competitor
competitive|/kəm'petıtıv/|adj|cạnh tranh|W|Highly competitive.|Có tính cạnh tranh cao.|ambitious, cutthroat|competitive market, competitive edge
complaint|/kəm'pleınt/|n|phàn nàn|F|Received many complaints.|Nhận nhiều lời phàn nàn.|grievance, criticism|make a complaint, customer complaint
complex|/'ka:mpleks/|adj|phức tạp|G|Complex instructions.|Hướng dẫn phức tạp.|complicated, intricate|highly complex, complex problem
concentrate|/'ka:nsəntreıt/|v|tập trung|W|Concentrate on studies.|Tập trung vào việc học.|focus, pay attention|concentrate hard, concentrate on
conclude|/kən'klu:d/|v|kết luận|W|Concluded the experiment.|Kết luận thí nghiệm.|finish, deduce|conclude that, safely conclude
conclusion|/kən'klu:ʒən/|n|kết luận|W|In conclusion.|Để kết luận.|end, result|draw a conclusion, jump to conclusions
confident|/'ka:nfıdənt/|adj|tự tin|F|Confident about presentation.|Tự tin về bài thuyết trình.|self-assured, positive|feel confident, quietly confident
confirm|/kən'fɜ:rm/|v|xác nhận|W|Confirm the date.|Xác nhận ngày tháng.|verify, approve|confirm a booking, confirm details
confuse|/kən'fju:z/|v|làm bối rối|F|Confused everyone.|Làm mọi người bối rối.|puzzle, bewilder|easily confuse, confuse with
confused|/kən'fju:zd/|adj|bối rối|F|He looked confused.|Anh ấy trông bối rối.|puzzled, mixed up|look confused, feel confused
connection|/kə'nekʃən/|n|kết nối|G|Strong connection.|Kết nối mạnh mẽ.|link, relationship|make a connection, internet connection
consequence|/'ka:nsıkwens/|n|hậu quả|G|Has its consequence.|Có hậu quả của nó.|result, effect|serious consequence, as a consequence
consist|/kən'sıst/|v|bao gồm|G|Consists of five members.|Bao gồm năm thành viên.|contain, include|consist of, mainly consist of
consume|/kən'sju:m/|v|tiêu thụ|L|Consume fast food.|Tiêu thụ thức ăn nhanh.|eat, use|consume energy, consume food
consumer|/kən'sju:mər/|n|người tiêu dùng|W|Consumer reviews.|Đánh giá của người tiêu dùng.|buyer, customer|consumer goods, consumer rights
contact|/'ka:ntækt/|v|liên hệ|W|Contact me.|Hãy liên hệ với tôi.|reach, touch|contact details, make contact
container|/kən'teınər/|n|thùng chứa|L|Plastic container.|Thùng chứa bằng nhựa.|box, bin|plastic container, glass container
content|/'ka:ntent/|n|nội dung|W|Content of the book.|Nội dung của cuốn sách.|material, substance|digital content, table of contents
continuous|/kən'tınjuəs/|adj|liên tục|G|Continuous rain.|Mưa liên tục.|ongoing, non-stop|continuous improvement, continuous process
contrast|/'ka:ntræst/|n|tương phản|G|A stark contrast.|Một sự tương phản rõ rệt.|difference, comparison|stark contrast, in contrast to
convenient|/kən'vi:niənt/|adj|tiện lợi|L|Convenient for shopping.|Tiện lợi cho việc mua sắm.|handy, suitable|highly convenient, convenient time
convince|/kən'vıns/|v|thuyết phục|G|He convinced me.|Anh ấy đã thuyết phục tôi.|persuade, assure|try to convince, fully convinced
cool|/ku:l/|v|làm mát|L|Let the soup cool.|Để súp nguội.|chill, refresh|keep cool, cool down
costume|/'ka:stu:m/|n|trang phục|E|A witch costume.|Một bộ trang phục phù thủy.|outfit, clothing|Halloween costume, national costume
cottage|/'ka:tıdʒ/|n|nhà tranh|T|A small cottage.|Một căn nhà tranh nhỏ.|cabin, hut|country cottage, cozy cottage
cotton|/'ka:tn/|n|bông|L|100% cotton.|100% bông.|fabric, thread|cotton shirt, pure cotton
count|/kaʊnt/|v|đếm|W|Count the chairs.|Đếm số ghế.|calculate, tally|count on, count down
countryside|/'kʌntrisaıd/|n|nông thôn|T|In the countryside.|Ở vùng nông thôn.|rural area, outdoors|beautiful countryside, in the countryside
court|/kɔ:rt/|n|tòa án|W|The court will hear the case.|Tòa án sẽ nghe vụ án.|tribunal, justice|go to court, tennis court
cover|/'kʌvər/|n|bìa|W|A beautiful cover.|Một bìa sách đẹp.|lid, wrapper|front cover, take cover
covered|/'kʌvərd/|adj|được bao phủ|G|Covered with a cloth.|Được bao phủ bằng một tấm vải.|hidden, wrapped|covered in snow, fully covered
cream|/kri:m/|adj|màu kem|L|Cream-colored walls.|Những bức tường màu kem.|off-white, pale|ice cream, skin cream
criminal|/'krımınəl/|adj|tội phạm|W|The criminal was arrested.|Tên tội phạm đã bị bắt.|illegal, unlawful|criminal record, criminal activity
cruel|/'kru:əl/|adj|độc ác|F|Cruel to animals.|Độc ác với động vật.|brutal, harsh|cruel intention, extremely cruel
cultural|/'kʌltʃərəl/|adj|văn hóa|E|Cultural festival.|Lễ hội văn hóa.|traditional, societal|cultural heritage, cultural differences
currency|/'kɜ:rənsi/|n|tiền tệ|W|The local currency.|Tiền tệ địa phương.|money, cash|foreign currency, local currency
current|/'kɜ:rənt/|adj|hiện tại|G|Current address.|Địa chỉ hiện tại.|present, ongoing|current situation, current events
currently|/'kɜ:rəntli/|adv|hiện tại|G|Currently studying.|Hiện tại đang học.|now, presently|currently available, currently working
curtain|/'kɜ:rtən/|n|rèm cửa|L|The blue curtain.|Tấm rèm màu xanh.|drape, blind|draw the curtain, open the curtain
custom|/'kʌstəm/|n|phong tục|E|A local custom.|Một phong tục địa phương.|tradition, practice|local custom, custom made
cut|/kʌt/|n|vết cắt|H|A cut on his finger.|Một vết cắt trên ngón tay.|slice, gash|deep cut, hair cut
daily|/'deıli/|adv|hàng ngày|L|Reads daily.|Đọc báo hàng ngày.|everyday, regularly|daily routine, daily basis
damage|/'dæmıdʒ/|n|thiệt hại|N|Significant damage.|Thiệt hại đáng kể.|harm, destruction|cause damage, severe damage
deal|/di:l/|n|thỏa thuận|W|Made a deal.|Đã làm một thỏa thuận.|agreement, contract|a great deal, deal with
decade|/'dekeıd/|n|thập kỷ|G|Over a decade.|Hơn một thập kỷ.|ten years, era|past decade, next decade
decorate|/'dekəreıt/|v|trang trí|L|Decorate the house.|Trang trí ngôi nhà.|adorn, ornament|decorate a room, beautifully decorated
deep|/di:p/|adv|sâu|N|Very deep.|Rất sâu.|far down, profoundly|deep breath, deep water
define|/dı'faın/|v|định nghĩa|W|Define the word.|Định nghĩa từ này.|explain, describe|clearly define, hard to define
definite|/'defınıt/|adj|rõ ràng|G|A definite answer.|Một câu trả lời rõ ràng.|clear, certain|definite answer, definite proof
definition|/,defı'nıʃən/|n|định nghĩa|W|Look up the definition.|Tra cứu định nghĩa.|meaning, explanation|clear definition, exact definition
deliver|/dı'lıvər/|v|giao hàng|W|Deliver the package.|Giao gói hàng.|bring, transport|deliver a baby, deliver a speech
departure|/dı'pa:rtʃər/|n|khởi hành|T|Departure time.|Thời gian khởi hành.|leaving, exit|departure lounge, early departure
despite|/dı'spaıt/|prep|mặc dù|G|Despite the rain.|Mặc dù trời mưa.|in spite of, regardless of|despite the fact, despite efforts
destination|/,destı'neıʃən/|n|điểm đến|T|Tourist destination.|Điểm đến du lịch.|target, end point|holiday destination, final destination
determine|/dı'tɜ:rmın/|v|xác định|G|Determine the cause.|Xác định nguyên nhân.|decide, resolve|determine the outcome, hard to determine
determined|/dı'tɜ:rmınd/|adj|quyết tâm|F|Determined to win.|Quyết tâm chiến thắng.|resolute, firm|highly determined, determined effort
development|/dı'veləpmənt/|n|sự phát triển|W|Development of technology.|Sự phát triển của công nghệ.|growth, advancement|economic development, personal development
diagram|/'daıəgræm/|n|sơ đồ|W|The diagram shows.|Sơ đồ cho thấy.|chart, graph|draw a diagram, flow diagram
diamond|/'daıəmənd/|n|kim cương|L|Diamond ring.|Nhẫn kim cương.|gem, jewel|diamond ring, rough diamond
difficulty|/'dıfıkəlti/|n|khó khăn|W|Had difficulty understanding.|Gặp khó khăn trong việc hiểu.|problem, trouble|great difficulty, overcome a difficulty
direct|/dı'rekt/|v|chỉ đạo|W|Direct the meeting.|Chỉ đạo cuộc họp.|guide, manage|direct a film, direct contact
directly|/dı'rektli/|adv|trực tiếp|W|Spoke directly.|Nói chuyện trực tiếp.|straight, face-to-face|directly related, look directly
dirt|/dɜ:rt/|n|bụi bẩn|N|Covered in dirt.|Bị dính đầy bụi bẩn.|soil, mud|dirt cheap, dirt track
disadvantage|/,dısəd'væntıdʒ/|n|bất lợi|G|One disadvantage.|Một điều bất lợi.|drawback, flaw|major disadvantage, at a disadvantage
disappointed|/,dısə'pɔıntıd/|adj|thất vọng|F|Disappointed with results.|Thất vọng với kết quả.|let down, saddened|bitterly disappointed, feel disappointed
disappointing|/,dısə'pɔıntıŋ/|adj|gây thất vọng|F|Disappointing movie.|Bộ phim gây thất vọng.|unsatisfactory, discouraging|deeply disappointing, disappointing result
discount|/'dıskaʊnt/|n|giảm giá|L|A 20% discount.|Giảm giá 20%.|reduction, sale|offer a discount, huge discount
dislike|/dıs'laık/|v|không thích|F|Dislike broccoli.|Không thích bông cải xanh.|hate, detest|strongly dislike, intense dislike
divide|/dı'vaıd/|v|chia rẽ|G|Divides the city.|Chia thành phố.|split, separate|divide into, evenly divide
documentary|/,da:kju'mentəri/|n|phim tài liệu|E|A fascinating documentary.|Một bộ phim tài liệu hấp dẫn.|factual film, broadcast|TV documentary, watch a documentary
donate|/'doʊneıt/|v|quyên góp|L|Donate old clothes.|Quyên góp quần áo cũ.|give, contribute|donate blood, donate money
double|/'dʌbəl/|adv|gấp đôi|G|Double espresso.|Espresso gấp đôi.|twice, twofold|double check, see double
doubt|/daʊt/|n|nghi ngờ|F|Have some doubts.|Có một số nghi ngờ.|uncertainty, suspicion|no doubt, without a doubt
dressed|/drest/|adj|ăn mặc|L|Elegantly dressed.|Ăn mặc thanh lịch.|clothed, attired|get dressed, well dressed
drop|/dra:p/|n|giọt|G|A drop of water.|Một giọt nước.|bead, tear|drop of rain, tear drop
drum|/drʌm/|n|trống|E|Plays the drums.|Chơi trống.|percussion, beat|play the drum, beat a drum
drunk|/drʌŋk/|adj|say rượu|L|Got drunk.|Bị say rượu.|intoxicated, wasted|get drunk, blind drunk
due|/du:/|adj|đến hạn|W|The rent is due.|Tiền thuê nhà đến hạn.|expected, scheduled|due date, past due
dust|/dʌst/|n|bụi|N|Covered in dust.|Bao phủ bởi bụi.|dirt, powder|gather dust, dust bunny
duty|/'du:ti/|n|nhiệm vụ|W|It is your duty.|Đó là nhiệm vụ của bạn.|responsibility, task|heavy duty, off duty
earthquake|/'ɜ:rθkweık/|n|động đất|N|Earthquake damage.|Thiệt hại do động đất.|tremor, quake|massive earthquake, earthquake hits
eastern|/'i:stərn/|adj|phía đông|G|Eastern part.|Phần phía đông.|oriental, east|eastern coast, eastern culture
economic|/,i:kə'na:mık/|adj|kinh tế|W|Economic challenges.|Thách thức kinh tế.|financial, commercial|economic growth, economic crisis
economy|/ı'ka:nəmi/|n|nền kinh tế|W|Growing economy.|Nền kinh tế đang phát triển.|wealth, finances|strong economy, global economy
edge|/edʒ/|n|mép, lề|G|Edge of the cliff.|Mép vách đá.|border, boundary|on the edge, cutting edge
editor|/'edıtər/|n|biên tập viên|W|The editor reviewed.|Biên tập viên đã xem lại.|reviewer, modifier|chief editor, newspaper editor
educate|/'edʒukeıt/|v|giáo dục|W|Educate children.|Giáo dục trẻ em.|teach, instruct|highly educate, educate people
educated|/'edʒukeıtıd/|adj|có học thức|W|Highly educated.|Có học thức cao.|learned, literate|well educated, educated guess
educational|/,edʒu'keıʃənəl/|adj|giáo dục|W|Educational purposes.|Mục đích giáo dục.|instructive, informative|educational system, educational background
effective|/ı'fektıv/|adj|hiệu quả|W|Very effective.|Rất hiệu quả.|successful, productive|highly effective, cost effective
effectively|/ı'fektıvli/|adv|một cách hiệu quả|W|Managed effectively.|Được quản lý một cách hiệu quả.|efficiently, successfully|communicate effectively, work effectively
effort|/'efərt/|n|nỗ lực|W|Put a lot of effort.|Đã nỗ lực rất nhiều.|attempt, try|make an effort, team effort
election|/ı'lekʃən/|n|bầu cử|W|Presidential election.|Bầu cử tổng thống.|vote, ballot|general election, win an election
element|/'eləmənt/|n|yếu tố|G|Essential element.|Yếu tố thiết yếu.|component, part|key element, crucial element
embarrassed|/ım'bærəst/|adj|bối rối|F|Felt embarrassed.|Cảm thấy bối rối.|ashamed, shy|deeply embarrassed, feel embarrassed
embarrassing|/ım'bærəsıŋ/|adj|làm ngượng|F|Embarrassing mistake.|Sai lầm làm ngượng ngùng.|awkward, humiliating|embarrassing moment, highly embarrassing
emergency|/ı'mɜ:rdʒənsi/|n|khẩn cấp|H|In case of emergency.|Trong trường hợp khẩn cấp.|crisis, urgency|emergency exit, medical emergency
emotion|/ı'moʊʃən/|n|cảm xúc|F|Hide her emotions.|Giấu cảm xúc của cô ấy.|feeling, passion|mixed emotions, show emotion
employment|/ım'plɔımənt/|n|việc làm|W|Looking for employment.|Tìm kiếm việc làm.|job, work|full-time employment, seek employment
empty|/'empti/|v|làm trống|G|Empty the trash.|Đổ rác.|clear, void|empty out, half empty
encourage|/ın'kɜ:rıdʒ/|v|khuyến khích|W|Encourage students.|Khuyến khích học sinh.|inspire, support|strongly encourage, encourage someone to
enemy|/'enəmi/|n|kẻ thù|G|They are enemies.|Họ là những kẻ thù.|foe, rival|bitter enemy, public enemy
engage|/ɪnˈɡeɪdʒ/|v|thu hút|W|Engage the audience.|Thu hút khán giả.|involve, attract|engage in, fully engage
engineering|/ˌendʒɪˈnɪərɪŋ/|n|ngành kỹ sư|W|Study engineering.|Học ngành kỹ thuật.|design, building|civil engineering, software engineering
entertain|/ˌentəˈteɪn/|v|giải trí|E|Entertain the guests.|Giải trí cho khách.|amuse, please|entertain the idea, well entertained
entertainment|/ˌentəˈteɪnmənt/|n|sự giải trí|E|Provide entertainment.|Cung cấp sự giải trí.|amusement, fun|home entertainment, entertainment industry
entrance|/ˈentrəns/|n|lối vào|G|The main entrance.|Lối vào chính.|entry, door|front entrance, entrance fee
entry|/ˈentri/|n|sự đi vào|G|No entry.|Cấm vào.|access, admission|entry level, gain entry
environmental|/ɪnˌvaɪrənˈmentl/|adj|thuộc môi trường|N|Environmental issues.|Các vấn đề môi trường.|ecological, green|environmental impact, environmental protection
episode|/ˈepɪsəʊd/|n|tập phim|E|The final episode.|Tập phim cuối cùng.|part, chapter|latest episode, TV episode
equal|/ˈiːkwəl/|adj|công bằng|G|Equal rights.|Quyền bình đẳng.|fair, same|equal opportunity, roughly equal
equally|/ˈiːkwəli/|adv|bằng nhau|G|Share equally.|Chia đều.|evenly, similarly|treat equally, divide equally
escape|/ɪˈskeɪp/|v|trốn thoát|G|Escape from prison.|Trốn thoát khỏi nhà tù.|flee, run away|narrow escape, escape route
essential|/ɪˈsenʃl/|adj|thiết yếu|G|Essential skills.|Kỹ năng thiết yếu.|vital, crucial|absolutely essential, essential oil
establish|/ɪˈstæblɪʃ/|v|thành lập|W|Establish a business.|Thành lập một doanh nghiệp.|found, set up|firmly establish, establish rules
estimate|/ˈestɪmeɪt/|v|ước tính|W|Estimate the cost.|Ước tính chi phí.|guess, calculate|rough estimate, cost estimate
ethical|/ˈeθɪkl/|adj|đạo đức|W|Ethical behavior.|Hành vi đạo đức.|moral, right|ethical standard, highly ethical
evaluate|/ɪˈvæljueɪt/|v|đánh giá|W|Evaluate the results.|Đánh giá kết quả.|assess, judge|carefully evaluate, evaluate performance
even|/ˈiːvn/|adv|thậm chí|G|Even better.|Thậm chí còn tốt hơn.|yet, still|even though, even if
event|/ɪˈvent/|n|sự kiện|E|A major event.|Một sự kiện lớn.|occurrence, happening|main event, upcoming event
eventually|/ɪˈventʃuəli/|adv|cuối cùng|G|Eventually they arrived.|Cuối cùng họ cũng đến.|finally, in the end|eventually lead to, die eventually
evidence|/ˈevɪdəns/|n|bằng chứng|W|Scientific evidence.|Bằng chứng khoa học.|proof, facts|strong evidence, clear evidence
exact|/ɪɡˈzækt/|adj|chính xác|G|The exact time.|Thời gian chính xác.|precise, accurate|exact amount, exact location
exactly|/ɪɡˈzæktli/|adv|chính xác|G|Exactly what I want.|Chính xác những gì tôi muốn.|precisely, perfectly|know exactly, exactly right
exaggerate|/ɪɡˈzædʒəreɪt/|v|phóng đại|G|Don't exaggerate.|Đừng phóng đại.|overstate, inflate|greatly exaggerate, tend to exaggerate
exam|/ɪɡˈzæm/|n|kỳ thi|W|Pass the exam.|Vượt qua kỳ thi.|test, assessment|final exam, fail an exam
examine|/ɪɡˈzæmɪn/|v|kiểm tra|H|Examine the patient.|Khám cho bệnh nhân.|inspect, investigate|closely examine, examine evidence
excellent|/ˈeksələnt/|adj|xuất sắc|F|Excellent performance.|Màn trình diễn xuất sắc.|outstanding, superb|truly excellent, excellent service
exception|/ɪkˈsepʃn/|n|ngoại lệ|G|Make an exception.|Tạo một ngoại lệ.|anomaly, deviation|with the exception of, notable exception
exchange|/ɪksˈtʃeɪndʒ/|v|trao đổi|W|Exchange currency.|Đổi tiền.|swap, trade|exchange rates, exchange ideas
excitement|/ɪkˈsaɪtmənt/|n|sự phấn khích|F|Full of excitement.|Tràn đầy sự phấn khích.|thrill, enthusiasm|cause excitement, feeling of excitement
exhibition|/ˌeksɪˈbɪʃn/|n|buổi triển lãm|E|Art exhibition.|Triển lãm nghệ thuật.|display, show|hold an exhibition, public exhibition
exist|/ɪɡˈzɪst/|v|tồn tại|G|Do aliens exist?|Người ngoài hành tinh có tồn tại không?|live, survive|cease to exist, currently exist
existence|/ɪɡˈzɪstəns/|n|sự tồn tại|G|The existence of God.|Sự tồn tại của Chúa.|being, survival|come into existence, human existence
expand|/ɪkˈspænd/|v|mở rộng|W|Expand the business.|Mở rộng kinh doanh.|grow, enlarge|rapidly expand, expand network
expect|/ɪkˈspekt/|v|mong đợi|G|Expect the best.|Mong đợi điều tốt nhất.|anticipate, await|fully expect, expect too much
expectation|/ˌekspekˈteɪʃn/|n|sự mong đợi|G|High expectations.|Sự mong đợi cao.|hope, belief|meet expectations, high expectation
expected|/ɪkˈspektɪd/|adj|được mong đợi|G|As expected.|Như đã mong đợi.|anticipated, predicted|highly expected, expected arrival
expense|/ɪkˈspens/|n|chi phí|W|At great expense.|Với chi phí lớn.|cost, charge|travel expense, spare no expense
experience|/ɪkˈspɪəriəns/|n|kinh nghiệm|W|Years of experience.|Nhiều năm kinh nghiệm.|knowledge, practice|gain experience, work experience
experienced|/ɪkˈspɪəriənst/|adj|có kinh nghiệm|W|Experienced staff.|Nhân viên có kinh nghiệm.|skilled, trained|highly experienced, experienced professional
experiment|/ɪkˈsperɪmənt/|n|thí nghiệm|W|Conduct an experiment.|Tiến hành một thí nghiệm.|test, trial|scientific experiment, conduct an experiment
expert|/ˈekspɜːt/|n|chuyên gia|W|A medical expert.|Một chuyên gia y tế.|specialist, professional|expert advice, leading expert
explain|/ɪkˈspleɪn/|v|giải thích|W|Explain the rules.|Giải thích các quy tắc.|clarify, describe|clearly explain, explain fully
explanation|/ˌekspləˈneɪʃn/|n|lời giải thích|W|A clear explanation.|Một lời giải thích rõ ràng.|reason, answer|give an explanation, detailed explanation
explode|/ɪkˈspləʊd/|v|phát nổ|G|The bomb exploded.|Quả bom đã phát nổ.|blow up, burst|suddenly explode, bomb exploded
explore|/ɪkˈsplɔː/|v|khám phá|T|Explore the city.|Khám phá thành phố.|discover, investigate|explore space, freely explore
explosion|/ɪkˈspləʊʒn/|n|vụ nổ|G|A loud explosion.|Một vụ nổ lớn.|blast, eruption|massive explosion, cause an explosion
export|/ˈekspɔːt/|v|xuất khẩu|W|Export goods.|Xuất khẩu hàng hóa.|sell overseas, ship|export market, export growth
expose|/ɪkˈspəʊz/|v|phơi bày|G|Expose the truth.|Phơi bày sự thật.|reveal, uncover|expose a secret, highly exposed
express|/ɪkˈspres/|v|bày tỏ|F|Express your feelings.|Bày tỏ cảm xúc của bạn.|state, articulate|express concern, freely express
expression|/ɪkˈspreʃn/|n|sự biểu hiện|F|An expression of joy.|Một biểu hiện của niềm vui.|look, statement|facial expression, expression of interest
extend|/ɪkˈstend/|v|kéo dài|W|Extend the deadline.|Kéo dài thời hạn.|lengthen, stretch|extend a visa, extend beyond
extent|/ɪkˈstent/|n|mức độ|G|To some extent.|Đến một mức độ nào đó.|degree, scale|full extent, to a certain extent
external|/ɪkˈstɜːnl/|adj|bên ngoài|G|External forces.|Các lực lượng bên ngoài.|outer, outside|external appearance, external pressure
extra|/ˈekstrə/|adj|thêm|G|Extra cheese.|Thêm phô mai.|additional, spare|extra charge, extra time
extraordinary|/ɪkˈstrɔːdnri/|adj|phi thường|F|Extraordinary talent.|Tài năng phi thường.|amazing, remarkable|extraordinary achievement, quite extraordinary
extreme|/ɪkˈstriːm/|adj|tột cùng|G|Extreme weather.|Thời tiết khắc nghiệt.|severe, intense|extreme heat, extreme poverty
extremely|/ɪkˈstriːmli/|adv|cực kỳ|G|Extremely hot.|Cực kỳ nóng.|very, highly|extremely difficult, extremely useful
fabric|/ˈfæbrɪk/|n|sợi vải|L|Soft fabric.|Sợi vải mềm.|cloth, material|cotton fabric, delicate fabric
face|/feɪs/|v|đối mặt|G|Face the challenge.|Đối mặt với thử thách.|confront, encounter|face facts, brave face
facility|/fəˈsɪləti/|n|cơ sở vật chất|W|Sports facility.|Cơ sở thể thao.|amenity, building|medical facility, excellent facility
factor|/ˈfæktə/|n|nhân tố|G|A key factor.|Một nhân tố chính.|element, cause|deciding factor, crucial factor
factory|/ˈfæktri/|n|nhà máy|W|Work in a factory.|Làm việc trong nhà máy.|plant, mill|car factory, factory worker
fail|/feɪl/|v|thất bại|W|Fail an exam.|Trượt kỳ thi.|collapse, fall|fail miserably, fail a test
failure|/ˈfeɪljə/|n|sự thất bại|W|A total failure.|Một sự thất bại hoàn toàn.|breakdown, collapse|complete failure, fear of failure
fair|/feə/|adj|công bằng|G|It's not fair.|Điều đó không công bằng.|just, unbiased|fair share, fair play
fairly|/ˈfeəli/|adv|khá|G|Fairly easy.|Khá dễ dàng.|quite, rather|fairly good, fairly typical
faith|/feɪθ/|n|đức tin|F|Have faith in God.|Có đức tin vào Chúa.|belief, trust|blind faith, lose faith
false|/fɔːls/|adj|sai|G|True or false.|Đúng hay sai.|untrue, fake|false impression, false alarm
familiar|/fəˈmɪliə/|adj|quen thuộc|G|A familiar face.|Một khuôn mặt quen thuộc.|known, recognizable|familiar with, look familiar
fancy|/ˈfænsi/|adj|sang trọng|L|A fancy restaurant.|Một nhà hàng sang trọng.|luxurious, lavish|fancy dress, fancy car
fantastic|/fænˈtæstɪk/|adj|tuyệt vời|F|A fantastic idea.|Một ý tưởng tuyệt vời.|wonderful, marvelous|absolutely fantastic, fantastic opportunity
fare|/feə/|n|giá vé|T|Bus fare.|Giá vé xe buýt.|ticket price, fee|train fare, pay the fare
fascinate|/ˈfæsɪneɪt/|v|mê hoặc|F|Science fascinates me.|Khoa học mê hoặc tôi.|captivate, enchant|fascinate deeply, continue to fascinate
fascinating|/ˈfæsɪneɪtɪŋ/|adj|hấp dẫn|F|A fascinating story.|Một câu chuyện hấp dẫn.|interesting, intriguing|fascinate topic, truly fascinating
fashion|/ˈfæʃn/|n|thời trang|L|Latest fashion.|Thời trang mới nhất.|style, trend|fashion industry, high fashion
fashionable|/ˈfæʃnəbl/|adj|hợp thời trang|L|Fashionable clothes.|Quần áo hợp thời trang.|trendy, stylish|highly fashionable, fashionable area
fasten|/ˈfɑːsn/|v|thắt chặt|T|Fasten your seatbelt.|Hãy thắt dây an toàn.|secure, tie|fasten securely, fasten seatbelt
fault|/fɔːlt/|n|lỗi lầm|G|It's my fault.|Đó là lỗi của tôi.|mistake, error|my own fault, find fault
favor|/ˈfeɪvə/|n|sự ân huệ|G|Do me a favor.|Hãy giúp tôi một việc.|help, kindness|do a favor, ask a favor
favorable|/ˈfeɪvərəbl/|adj|thuận lợi|G|Favorable conditions.|Điều kiện thuận lợi.|advantageous, positive|favorable outcome, highly favorable
favorite|/ˈfeɪvərɪt/|adj|yêu thích|F|My favorite color.|Màu sắc yêu thích của tôi.|preferred, best-loved|all-time favorite, firm favorite
fear|/fɪə/|n|nỗi sợ hãi|F|Overcome your fear.|Vượt qua nỗi sợ hãi.|terror, fright|great fear, irrational fear
feature|/ˈfiːtʃə/|n|đặc điểm|W|A new feature.|Một tính năng mới.|characteristic, attribute|main feature, special feature
fee|/fiː/|n|lệ phí|W|Pay a fee.|Trả lệ phí.|charge, cost|entrance fee, tuition fee
feed|/fiːd/|v|cho ăn|L|Feed the dog.|Cho chó ăn.|nourish, supply|feed the baby, well fed
feedback|/ˈfiːdbæk/|n|phản hồi|W|Give feedback.|Đưa ra phản hồi.|response, comments|positive feedback, provide feedback
feel|/fiːl/|v|cảm thấy|F|Feel happy.|Cảm thấy hạnh phúc.|experience, sense|feel deeply, make you feel
feeling|/ˈfiːlɪŋ/|n|cảm giác|F|A feeling of joy.|Một cảm giác vui sướng.|emotion, sense|strong feeling, gut feeling
female|/ˈfiːmeɪl/|adj|nữ giới|G|Female workers.|Nhân viên nữ.|woman, feminine|female employee, female lead
fence|/fens/|n|hàng rào|L|A wooden fence.|Một hàng rào gỗ.|barrier, boundary|wooden fence, jump the fence
festival|/ˈfestɪvl/|n|lễ hội|E|Music festival.|Lễ hội âm nhạc.|carnival, celebration|annual festival, film festival
fetch|/fetʃ/|v|đi lấy|G|Fetch some water.|Đi lấy ít nước.|get, retrieve|go and fetch, fetch a price
fiction|/ˈfɪkʃn/|n|tiểu thuyết|E|Science fiction.|Khoa học viễn tưởng.|story, fantasy|science fiction, romantic fiction
field|/fiːld/|n|cánh đồng|N|A green field.|Một cánh đồng xanh.|meadow, pasture|football field, field of study
figure|/ˈfɪɡə/|n|con số|W|Sales figures.|Các con số bán hàng.|number, digit|exact figure, double figures
file|/faɪl/|n|hồ sơ|W|Open the file.|Mở hồ sơ.|document, folder|computer file, keep on file
fill|/fɪl/|v|làm đầy|G|Fill the glass.|Làm đầy ly nước.|pack, stuff|fill up, completely fill
film|/fɪlm/|n|bộ phim|E|Watch a film.|Xem một bộ phim.|movie, picture|feature film, direct a film
final|/ˈfaɪnl/|adj|cuối cùng|G|Final exam.|Kỳ thi cuối cùng.|last, ultimate|final decision, final outcome
finally|/ˈfaɪnəli/|adv|cuối cùng|G|Finally arrived.|Cuối cùng cũng đến.|eventually, lastly|finally decided, arrive finally
finance|/ˈfaɪnæns/|n|tài chính|W|Minister of Finance.|Bộ trưởng tài chính.|economics, money|personal finance, raise finance
financial|/faɪˈnænʃl/|adj|thuộc tài chính|W|Financial support.|Hỗ trợ tài chính.|economic, monetary|financial crisis, financial advisor
find|/faɪnd/|v|tìm thấy|G|Find a job.|Tìm một công việc.|discover, locate|hard to find, easily find
finding|/ˈfaɪndɪŋ/|n|phát hiện|W|New findings.|Những phát hiện mới.|discovery, result|key finding, recent finding
fine|/faɪn/|adj|tốt|F|I feel fine.|Tôi cảm thấy khỏe.|good, okay|perfectly fine, do fine
finger|/ˈfɪŋɡə/|n|ngón tay|H|Cut my finger.|Cắt vào ngón tay.|digit, thumb|index finger, point a finger
finish|/ˈfɪnɪʃ/|v|hoàn thành|G|Finish work.|Hoàn thành công việc.|complete, end|finish completely, nearly finish
fire|/faɪə/|n|lửa|G|Make a fire.|Tạo một ngọn lửa.|blaze, flame|catch fire, light a fire
firm|/fɜːm/|n|công ty|W|A law firm.|Một công ty luật.|company, business|law firm, accounting firm
firmly|/ˈfɜːmli/|adv|chắc chắn|G|Hold firmly.|Giữ chắc chắn.|strongly, securely|believe firmly, hold firmly
fit|/fɪt/|adj|vừa vặn|L|The shoes fit.|Đôi giày vừa vặn.|suitable, healthy|perfectly fit, keep fit
fix|/fɪks/|v|sửa chữa|W|Fix the car.|Sửa xe ô tô.|repair, mend|fix a problem, quick fix
fixed|/fɪkst/|adj|cố định|G|Fixed price.|Giá cố định.|set, permanent|fixed rate, fixed firmly
flash|/flæʃ/|n|tia sáng|G|A flash of lightning.|Một tia chớp.|burst, spark|flash of light, camera flash
flat|/flæt/|n|căn hộ|L|A nice flat.|Một căn hộ đẹp.|apartment, unit|rent a flat, flat tire
flavor|/ˈfleɪvə/|n|hương vị|L|Vanilla flavor.|Hương vị vani.|taste, seasoning|strong flavor, add flavor
flesh|/fleʃ/|n|thịt|H|Human flesh.|Thịt người.|meat, skin|flesh and blood, rotting flesh
flight|/flaɪt/|n|chuyến bay|T|Book a flight.|Đặt một chuyến bay.|journey, trip|direct flight, miss a flight
float|/fləʊt/|v|nổi|N|Float on water.|Nổi trên mặt nước.|drift, hover|float away, float freely
flood|/flʌd/|n|lũ lụt|N|A massive flood.|Một trận lũ lụt lớn.|inundation, deluge|flash flood, severe flood
floor|/flɔː/|n|sàn nhà|L|Sweep the floor.|Quét sàn nhà.|ground, surface|ground floor, hardwood floor
flow|/fləʊ/|v|chảy|N|Water flows.|Nước chảy.|run, stream|flow freely, cash flow
flower|/ˈflaʊə/|n|bông hoa|N|A beautiful flower.|Một bông hoa đẹp.|blossom, bloom|wild flower, pick a flower
fly|/flaɪ/|v|bay|T|Fly to Paris.|Bay đến Paris.|soar, glide|fly high, learn to fly
focus|/ˈfəʊkəs/|v|tập trung|W|Focus on studies.|Tập trung vào việc học.|concentrate, center|main focus, lose focus
fold|/fəʊld/|v|gấp|L|Fold the paper.|Gấp tờ giấy.|crease, bend|fold neatly, fold in half
folding|/ˈfəʊldɪŋ/|adj|có thể gấp lại|L|Folding chair.|Ghế gấp.|collapsible, bendable|folding table, folding bike
folk|/fəʊk/|n|dân gian|E|Folk music.|Nhạc dân gian.|traditional, people|folk tale, folk dance
follow|/ˈfɒləʊ/|v|theo sau|G|Follow me.|Đi theo tôi.|pursue, track|follow closely, blindly follow
following|/ˈfɒləʊɪŋ/|adj|tiếp theo|G|The following day.|Ngày hôm sau.|next, subsequent|the following week, following instructions
fond|/fɒnd/|adj|yêu thích|F|Fond of music.|Thích âm nhạc.|affectionate, keen|grow fond of, deeply fond
food|/fuːd/|n|thức ăn|L|Healthy food.|Thức ăn tốt cho sức khỏe.|meal, nourishment|junk food, food poisoning
fool|/fuːd/|n|kẻ ngốc|F|Don't be a fool.|Đừng là kẻ ngốc.|idiot, dummy|play the fool, make a fool of
foot|/fʊt/|n|bàn chân|H|My right foot.|Bàn chân phải của tôi.|paw, base|on foot, bare foot
football|/ˈfʊtbɔːl/|n|bóng đá|E|Play football.|Chơi bóng đá.|soccer, game|football match, football pitch
force|/fɔːs/|n|lực lượng|W|Police force.|Lực lượng cảnh sát.|power, strength|brute force, driving force
forecast|/ˈfɔːkɑːst/|n|dự báo|W|Weather forecast.|Dự báo thời tiết.|prediction, projection|economic forecast, accurate forecast
foreign|/ˈfɒrən/|adj|nước ngoài|T|Foreign language.|Ngoại ngữ.|overseas, alien|foreign country, foreign policy
forest|/ˈfɒrɪst/|n|rừng|N|A dark forest.|Một khu rừng tối.|wood, jungle|dense forest, rain forest
forever|/fərˈevə/|adv|mãi mãi|G|Lasts forever.|Tồn tại mãi mãi.|always, endlessly|live forever, last forever
forget|/fəˈɡet/|v|quên|G|Don't forget.|Đừng quên.|fail to remember, overlook|completely forget, never forget
forgive|/fəˈɡɪv/|v|tha thứ|F|Forgive me.|Hãy tha thứ cho tôi.|excuse, pardon|forgive easily, hard to forgive
fork|/fɔːk/|n|cái nĩa|L|Knife and fork.|Dao và nĩa.|prong, branch|use a fork, fork in the road
form|/fɔːm/|n|mẫu đơn|W|Fill out the form.|Điền vào mẫu đơn.|document, shape|application form, take form
formal|/ˈfɔːml/|adj|trang trọng|G|Formal dress.|Trang phục trang trọng.|official, proper|formal education, formal event
formally|/ˈfɔːməli/|adv|một cách trang trọng|G|Dress formally.|Ăn mặc trang trọng.|officially, properly|formally dress, formally announce
format|/ˈfɔːmæt/|n|định dạng|W|File format.|Định dạng tệp.|layout, design|standard format, change format
former|/ˈfɔːmə/|adj|cũ, trước đây|G|Former president.|Cựu tổng thống.|previous, past|former boss, former glory
formerly|/ˈfɔːməli/|adv|trước đây|G|Formerly known as.|Trước đây được biết đến như là.|previously, historically|formerly employed, formerly called
formula|/ˈfɔːmjələ/|n|công thức|W|Math formula.|Công thức toán học.|equation, recipe|secret formula, winning formula
fort|/fɔːt/|n|pháo đài|T|An ancient fort.|Một pháo đài cổ.|fortress, stronghold|build a fort, hold the fort
fortunate|/ˈfɔːtʃənət/|adj|may mắn|F|I am fortunate.|Tôi rất may mắn.|lucky, blessed|extremely fortunate, feel fortunate
fortune|/ˈfɔːtʃuːn/|n|gia tài|W|Make a fortune.|Kiếm một gia tài.|wealth, luck|good fortune, spend a fortune
forward|/ˈfɔːwəd/|adv|về phía trước|G|Look forward.|Nhìn về phía trước.|ahead, onward|move forward, step forward
found|/faʊnd/|v|thành lập|W|Found a company.|Thành lập một công ty.|establish, start|newly founded, found an organization
foundation|/faʊnˈdeɪʃn/|n|nền tảng|W|Strong foundation.|Nền tảng vững chắc.|base, basis|lay the foundation, solid foundation
frame|/freɪm/|n|khung|L|Picture frame.|Khung tranh.|border, casing|wooden frame, frame of mind
free|/friː/|adj|tự do|G|Free speech.|Tự do ngôn luận.|independent, complimentary|free of charge, feel free
freedom|/ˈfriːdəm/|n|sự tự do|G|Freedom of choice.|Tự do lựa chọn.|liberty, independence|complete freedom, fight for freedom
freeze|/friːz/|v|đóng băng|N|Water freezes.|Nước đóng băng.|solidify, ice|freeze solid, freeze to death
frequency|/ˈfriːkwənsi/|n|tần suất|W|High frequency.|Tần suất cao.|rate, pace|increasing frequency, high frequency
frequent|/ˈfriːkwənt/|adj|thường xuyên|G|Frequent visits.|Các chuyến thăm thường xuyên.|regular, common|highly frequent, frequent traveler
frequently|/ˈfriːkwəntli/|adv|một cách thường xuyên|G|We meet frequently.|Chúng tôi gặp nhau thường xuyên.|often, regularly|occur frequently, update frequently
fresh|/freʃ/|adj|tươi|L|Fresh fruit.|Trái cây tươi.|new, crisp|fresh air, fresh start
freshly|/ˈfreʃli/|adv|mới, vừa mới|L|Freshly baked.|Vừa mới nướng.|newly, recently|freshly brewed, freshly picked
friction|/ˈfrɪkʃn/|n|ma sát|W|Cause friction.|Gây ra ma sát.|rubbing, resistance|create friction, cause friction
friend|/frend/|n|bạn bè|L|A good friend.|Một người bạn tốt.|pal, mate|close friend, make friends
friendly|/ˈfrendli/|adj|thân thiện|F|Friendly staff.|Nhân viên thân thiện.|welcoming, kind|very friendly, eco-friendly
friendship|/ˈfrendʃɪp/|n|tình bạn|F|True friendship.|Tình bạn đích thực.|relationship, bond|close friendship, lifelong friendship
fright|/fraɪt/|n|sự hoảng sợ|F|Die of fright.|Chết vì sợ.|fear, terror|take fright, give a fright
frighten|/ˈfraɪtn/|v|làm hoảng sợ|F|Don't frighten him.|Đừng làm anh ấy sợ.|scare, terrify|frighten easily, frighten to death
frightened|/ˈfraɪtnd/|adj|bị hoảng sợ|F|Feel frightened.|Cảm thấy hoảng sợ.|scared, terrified|look frightened, badly frightened
frog|/frɒɡ/|n|con ếch|N|A green frog.|Một con ếch xanh.|amphibian, toad|catch a frog, frog leaps
front|/frʌnt/|n|phía trước|G|In front of.|Ở phía trước của.|fore, leading|front door, front row
frozen|/ˈfrəʊzn/|adj|bị đông lạnh|L|Frozen food.|Thực phẩm đông lạnh.|icy, cold|frozen solid, frozen peas
fruit|/fruːt/|n|trái cây|L|Eat more fruit.|Ăn nhiều trái cây.|produce, crop|fresh fruit, tropical fruit
fry|/fraɪ/|v|chiên|L|Fry an egg.|Chiên một quả trứng.|cook, sizzle|deep fry, pan fry
fuel|/ˈfjuːəl/|n|nhiên liệu|T|Fossil fuel.|Nhiên liệu hóa thạch.|gas, energy|run out of fuel, fuel tank
fulfil|/fʊlˈfɪl/|v|hoàn thành|W|Fulfil a promise.|Thực hiện một lời hứa.|achieve, satisfy|fulfil a dream, completely fulfil
full|/fʊl/|adj|đầy|G|A full glass.|Một ly đầy.|filled, complete|full time, full of
fully|/ˈfʊli/|adv|hoàn toàn|G|Fully understand.|Hiểu hoàn toàn.|completely, entirely|fully aware, fully equipped
fun|/fʌn/|n|niềm vui|E|Have fun.|Có niềm vui.|enjoyment, amusement|great fun, just for fun
function|/ˈfʌŋkʃn/|n|chức năng|W|Main function.|Chức năng chính.|purpose, role|vital function, brain function
fund|/fʌnd/|n|quỹ|W|Raise a fund.|Gây quỹ.|capital, savings|pension fund, trust fund
fundamental|/ˌfʌndəˈmentl/|adj|cơ bản|W|Fundamental rights.|Quyền cơ bản.|basic, core|fundamental difference, fundamental change
funeral|/ˈfjuːnərəl/|n|đám tang|L|Attend a funeral.|Dự một đám tang.|burial, memorial|arrange a funeral, funeral service
funny|/ˈfʌni/|adj|hài hước|F|A funny joke.|Một câu chuyện cười hài hước.|humorous, amusing|really funny, find it funny
fur|/fɜː/|n|lông thú|N|Soft fur.|Lông thú mềm.|hair, coat|animal fur, fake fur
furniture|/ˈfɜːnɪtʃə/|n|nội thất|L|Buy furniture.|Mua đồ nội thất.|furnishings, fittings|wooden furniture, piece of furniture
furthermore|/ˌfɜːðəˈmɔː/|adv|hơn nữa|G|Furthermore, I agree.|Hơn nữa, tôi đồng ý.|moreover, additionally|and furthermore, completely agree furthermore
future|/ˈfjuːtʃə/|n|tương lai|G|In the future.|Trong tương lai.|tomorrow, destiny|near future, bright future
gain|/geın/|v|giành được|W|Gain experience.|Giành được kinh nghiệm.|acquire, obtain|gain weight, gain access
gap|/gæp/|n|khoảng trống|G|Mind the gap.|Chú ý khoảng trống.|space, opening|bridge the gap, generation gap
garbage|/'ga:rbıdʒ/|n|rác|L|Take out the garbage.|Đổ rác.|trash, rubbish|garbage can, collect garbage
gather|/'gæðər/|v|tụ tập|G|Gather around.|Tụ tập xung quanh.|collect, assemble|gather information, gather together
general|/'dʒenərəl/|adj|chung|G|General knowledge.|Kiến thức chung.|broad, common|in general, general public
generally|/'dʒenərəli/|adv|nhìn chung|G|Generally speaking.|Nhìn chung mà nói.|mostly, typically|generally accepted, generally agree
generation|/,dʒenə'reıʃən/|n|thế hệ|L|The younger generation.|Thế hệ trẻ.|age group, era|next generation, older generation
generous|/'dʒenərəs/|adj|hào phóng|F|A generous gift.|Một món quà hào phóng.|giving, kind|very generous, generous offer
gentle|/'dʒentl/|adj|nhẹ nhàng|F|A gentle touch.|Một cái chạm nhẹ nhàng.|soft, mild|gentle breeze, gentle voice
gentleman|/'dʒentlmən/|n|quý ông|L|A true gentleman.|Một quý ông thực sự.|man, sir|perfect gentleman, ladies and gentlemen
ghost|/goʊst/|n|ma quỷ|E|A scary ghost.|Một con ma đáng sợ.|spirit, phantom|see a ghost, ghost story
giant|/'dʒaıənt/|adj|khổng lồ|G|A giant tree.|Một cái cây khổng lồ.|huge, massive|giant step, sleeping giant
glad|/glæd/|adj|vui mừng|F|I am glad.|Tôi rất vui mừng.|happy, pleased|really glad, glad to hear
global|/'gloʊbl/|adj|toàn cầu|G|Global warming.|Sự nóng lên toàn cầu.|worldwide, international|global economy, global market
glove|/glʌv/|n|găng tay|L|A pair of gloves.|Một đôi găng tay.|mitten, gauntlet|wear gloves, leather gloves
goal|/goʊl/|n|mục tiêu|W|Reach your goal.|Đạt được mục tiêu của bạn.|target, aim|achieve a goal, set a goal
god|/ga:d/|n|Chúa|G|Oh my God!|Ôi Chúa ơi!|deity, creator|believe in God, pray to God
gold|/goʊld/|n|vàng|L|A gold ring.|Một chiếc nhẫn vàng.|valuable, metal|solid gold, gold medal
good|/gʊd/|adj|tốt|G|Good morning.|Chào buổi sáng.|fine, excellent|very good, good idea
govern|/'gʌvərn/|v|cai trị|W|Govern a country.|Cai trị một đất nước.|rule, control|govern effectively, right to govern
government|/'gʌvərnmənt/|n|chính phủ|W|Government policy.|Chính sách chính phủ.|administration, regime|local government, government official
grab|/græb/|v|vồ lấy|G|Grab a coffee.|Lấy vội một tách cà phê.|snatch, seize|grab a bite, grab hold of
grade|/greıd/|n|điểm số|W|Get a good grade.|Đạt điểm tốt.|mark, score|high grade, pass a grade
gradually|/'grædʒuəli/|adv|dần dần|G|Gradually improve.|Cải thiện dần dần.|slowly, steadily|gradually become, increase gradually
grain|/greın/|n|ngũ cốc|N|A grain of sand.|Một hạt cát.|seed, cereal|whole grain, grain of truth
grammar|/'græmər/|n|ngữ pháp|W|English grammar.|Ngữ pháp tiếng Anh.|syntax, rules|poor grammar, grammar rules
grand|/grænd/|adj|hoành tráng|G|A grand opening.|Sự kiện khai trương hoành tráng.|magnificent, impressive|grand piano, grand scale
grant|/grænt/|v|cấp cho|W|Grant permission.|Cấp quyền.|allow, award|take for granted, grant access
grass|/græs/|n|cỏ|N|Green grass.|Cỏ xanh.|lawn, turf|cut the grass, lie on the grass
grateful|/'greıtfl/|adj|biết ơn|F|I am grateful.|Tôi rất biết ơn.|thankful, appreciative|deeply grateful, eternally grateful
grave|/greıv/|n|ngôi mộ|L|Visit a grave.|Thăm một ngôi mộ.|tomb, burial place|dig a grave, beyond the grave
greatly|/'greıtli/|adv|rất nhiều|G|Greatly appreciate.|Rất trân trọng.|immensely, significantly|greatly admire, greatly influence
greet|/gri:t/|v|chào hỏi|G|Greet the guests.|Chào khách.|welcome, salute|warmly greet, greet with a smile
ground|/graʊnd/|n|mặt đất|N|On the ground.|Trên mặt đất.|earth, floor|fall to the ground, solid ground
group|/gru:p/|n|nhóm|G|A group of people.|Một nhóm người.|team, crowd|small group, join a group
grow|/groʊ/|v|phát triển|N|Grow plants.|Trồng cây.|develop, expand|grow rapidly, grow up
growth|/groʊθ/|n|sự phát triển|W|Economic growth.|Sự phát triển kinh tế.|expansion, increase|rapid growth, population growth
guarantee|/,gærən'ti:/|v|đảm bảo|W|Guarantee success.|Đảm bảo thành công.|assure, promise|money back guarantee, fully guaranteed
guard|/ga:rd/|n|bảo vệ|W|Security guard.|Nhân viên an ninh.|protector, sentry|stand guard, security guard
guess|/ges/|v|đoán|G|Guess what?|Đoán xem nào?|estimate, suppose|educated guess, hard to guess
guest|/gest/|n|khách|L|Be my guest.|Làm khách của tôi nhé.|visitor, caller|special guest, hotel guest
guide|/gaıd/|n|hướng dẫn|T|Tour guide.|Hướng dẫn viên du lịch.|leader, mentor|tour guide, guide book
guilty|/'gılti/|adj|có tội|F|Feel guilty.|Cảm thấy có lỗi.|culpable, remorseful|plead guilty, feel guilty
gun|/gʌn/|n|khẩu súng|G|Hold a gun.|Cầm một khẩu súng.|weapon, firearm|point a gun, machine gun
guy|/gaı/|n|chàng trai|L|A nice guy.|Một chàng trai tốt.|man, fellow|tough guy, good guy
habit|/'hæbıt/|n|thói quen|H|Good habit.|Thói quen tốt.|routine, practice|break a habit, bad habit
hair|/her/|n|tóc|H|Long hair.|Tóc dài.|locks, tresses|blonde hair, cut hair
half|/hæf/|n|một nửa|G|Half an hour.|Nửa giờ.|fifty percent, portion|half price, cut in half
hall|/hɔ:l/|n|sảnh|L|City hall.|Tòa thị chính.|corridor, lobby|dining hall, concert hall
hand|/hænd/|n|bàn tay|H|Hold my hand.|Giữ tay tôi.|palm, fist|shake hands, hand in hand
handle|/'hændl/|v|xử lý|W|Handle a problem.|Xử lý một vấn đề.|manage, deal with|handle carefully, difficult to handle
hang|/hæŋ/|v|treo|L|Hang a picture.|Treo một bức tranh.|suspend, dangle|hang out, hang up
happen|/'hæpən/|v|xảy ra|G|What happened?|Chuyện gì đã xảy ra?|occur, take place|happen suddenly, bound to happen
happily|/'hæpıli/|adv|một cách hạnh phúc|F|Live happily.|Sống hạnh phúc.|joyfully, gladly|live happily ever after, smile happily
happiness|/'hæpinəs/|n|sự hạnh phúc|F|True happiness.|Hạnh phúc đích thực.|joy, delight|bring happiness, pursue happiness
happy|/'hæpi/|adj|hạnh phúc|F|Be happy.|Hãy hạnh phúc.|glad, joyful|feel happy, perfectly happy
hard|/ha:rd/|adj|khó khăn|G|Work hard.|Làm việc chăm chỉ.|difficult, tough|try hard, hard work
hardly|/'ha:rdli/|adv|hầu như không|G|Hardly ever.|Hầu như không bao giờ.|barely, scarcely|hardly breathe, can hardly wait
harm|/ha:rm/|n|sự tổn hại|G|Cause harm.|Gây tổn hại.|damage, hurt|do harm, physical harm
harmful|/'ha:rmfl/|adj|có hại|H|Harmful chemicals.|Hóa chất có hại.|damaging, dangerous|potentially harmful, harmful effects
hat|/hæt/|n|mũ|L|Wear a hat.|Đội mũ.|cap, headgear|wear a hat, take off your hat
hate|/heıt/|v|ghét|F|I hate spiders.|Tôi ghét nhện.|dislike, detest|really hate, hate crime
head|/hed/|n|cái đầu|H|Nod your head.|Gật đầu.|skull, brain|shake your head, head first
headache|/'hedeık/|n|đau đầu|H|I have a headache.|Tôi bị đau đầu.|migraine, pain|terrible headache, splitting headache
heal|/hi:l/|v|chữa lành|H|Heal the wound.|Chữa lành vết thương.|cure, recover|heal completely, time heals
health|/helθ/|n|sức khỏe|H|Good health.|Sức khỏe tốt.|fitness, wellbeing|in good health, health care
healthy|/'helθi/|adj|khỏe mạnh|H|Stay healthy.|Giữ gìn sức khỏe.|fit, well|healthy diet, keep healthy
hear|/hır/|v|nghe|G|I hear you.|Tôi nghe bạn nói.|listen, catch|hear clearly, hard of hearing
heart|/ha:rt/|n|trái tim|H|A kind heart.|Một trái tim nhân hậu.|core, center|break someone's heart, heart attack
heat|/hi:t/|n|sức nóng|N|Summer heat.|Cái nóng mùa hè.|warmth, temperature|extreme heat, turn up the heat
heavily|/'hevıli/|adv|nặng nề|G|Rain heavily.|Mưa nặng hạt.|weightily, intensely|rely heavily on, breathe heavily
heavy|/'hevi/|adj|nặng|G|A heavy box.|Một cái hộp nặng.|weighty, massive|heavy rain, heavy traffic
height|/haıt/|n|chiều cao|G|Measure the height.|Đo chiều cao.|tallness, elevation|great height, average height
hell|/hel/|n|địa ngục|G|Go to hell.|Xuống địa ngục đi.|underworld, abyss|make life hell, go through hell
hello|/he'loʊ/|exclam|xin chào|G|Say hello.|Nói xin chào.|hi, greetings|say hello, big hello
help|/help/|v|giúp đỡ|G|Help me please.|Hãy giúp tôi.|assist, aid|need help, offer help
helpful|/'helpfl/|adj|hữu ích|F|Helpful advice.|Lời khuyên hữu ích.|useful, supportive|extremely helpful, helpful hint
hero|/'hıroʊ/|n|anh hùng|E|A national hero.|Một anh hùng dân tộc.|idol, champion|local hero, unsung hero
hide|/haıd/|v|trốn|G|Hide and seek.|Trò trốn tìm.|conceal, cover|hide completely, nothing to hide
high|/haı/|adj|cao|G|A high mountain.|Một ngọn núi cao.|tall, elevated|high quality, high standard
highly|/'haıli/|adv|rất cao|G|Highly recommended.|Rất được khuyến khích.|very, extremely|highly likely, highly effective
hill|/hıl/|n|ngọn đồi|N|Climb a hill.|Leo lên một ngọn đồi.|mound, slope|steep hill, roll down a hill
hire|/'haıər/|v|thuê|W|Hire a car.|Thuê một chiếc xe.|rent, employ|hire new staff, available for hire
historical|/hı'stɔ:rıkl/|adj|lịch sử|W|Historical facts.|Những sự thật lịch sử.|past, ancient|historical context, historical event
history|/'hıstəri/|n|lịch sử|W|Study history.|Học lịch sử.|past, antiquity|make history, history book
hit|/hıt/|v|đánh|G|Hit the ball.|Đánh quả bóng.|strike, beat|hit hard, smash hit
hold|/hoʊld/|v|giữ|G|Hold the door.|Giữ cửa.|keep, grasp|hold tightly, put on hold
hole|/hoʊl/|n|cái hố|G|A deep hole.|Một cái hố sâu.|gap, opening|dig a hole, black hole
holiday|/'ha:lədeı/|n|kỳ nghỉ|T|Summer holiday.|Kỳ nghỉ hè.|vacation, break|public holiday, go on holiday
hollow|/'ha:loʊ/|adj|rỗng|G|A hollow tree.|Một cái cây rỗng.|empty, void|hollow sound, hollow tube
holy|/'hoʊli/|adj|linh thiêng|G|Holy water.|Nước thánh.|sacred, divine|holy spirit, holy site
home|/hoʊm/|n|nhà|L|Go home.|Về nhà.|residence, house|feel at home, stay at home
honest|/'a:nıst/|adj|trung thực|F|Be honest.|Hãy trung thực.|truthful, sincere|brutally honest, completely honest
honestly|/'a:nıstli/|adv|một cách trung thực|F|Honestly speaking.|Thành thật mà nói.|truthfully, sincerely|honestly believe, speak honestly
honey|/'hʌni/|n|mật ong|L|Sweet honey.|Mật ong ngọt.|nectar, sweetness|milk and honey, honey bee
honor|/'a:nər/|n|danh dự|F|A matter of honor.|Một vấn đề danh dự.|respect, prestige|guest of honor, badge of honor
hope|/hoʊp/|v|hy vọng|F|I hope so.|Tôi hy vọng vậy.|wish, desire|sincerely hope, high hopes
hopefully|/'hoʊpfəli/|adv|hy vọng là|F|Hopefully it won't rain.|Hy vọng trời sẽ không mưa.|optimistically, crossing fingers|hopefully soon, wait hopefully
horrible|/'hɔ:rəbl/|adj|kinh khủng|F|A horrible mistake.|Một sai lầm kinh khủng.|terrible, awful|absolutely horrible, horrible smell
horror|/'hɔ:rər/|n|sự kinh dị|E|Horror movie.|Phim kinh dị.|terror, fear|horror film, watch in horror
horse|/hɔ:rs/|n|con ngựa|N|Ride a horse.|Cưỡi một con ngựa.|stallion, mare|ride a horse, race horse
hospital|/'ha:spıtl/|n|bệnh viện|H|Go to the hospital.|Đi đến bệnh viện.|clinic, medical center|admitted to hospital, local hospital
host|/hoʊst/|n|chủ nhà|L|A gracious host.|Một người chủ hiếu khách.|presenter, entertainer|play host, TV host
hot|/ha:t/|adj|nóng|N|Hot weather.|Thời tiết nóng.|boiling, burning|piping hot, hot summer
hotel|/hoʊ'tel/|n|khách sạn|T|Book a hotel.|Đặt một khách sạn.|inn, resort|luxury hotel, book a hotel
hour|/'aʊər/|n|giờ|G|Wait an hour.|Đợi một giờ.|sixty minutes, time|rush hour, half an hour
house|/haʊs/|n|ngôi nhà|L|A beautiful house.|Một ngôi nhà đẹp.|home, building|move house, buy a house
household|/'haʊshoʊld/|n|hộ gia đình|L|Household chores.|Việc nhà.|family, domestic|household name, household items
housing|/'haʊzıŋ/|n|nhà ở|L|Housing market.|Thị trường nhà ở.|accommodation, living|affordable housing, housing estate
how|/haʊ/|adv|như thế nào|G|How are you?|Bạn khỏe không?|in what way, by what means|how much, know how
however|/haʊ'evər/|adv|tuy nhiên|G|However, I disagree.|Tuy nhiên, tôi không đồng ý.|nevertheless, yet|however hard, however much
huge|/hju:dʒ/|adj|khổng lồ|G|A huge building.|Một tòa nhà khổng lồ.|massive, enormous|huge success, huge amount
human|/'hju:mən/|n|con người|G|Human rights.|Quyền con người.|person, mortal|human being, human nature
humor|/'hju:mər/|n|sự hài hước|F|Sense of humor.|Khiếu hài hước.|comedy, wit|sense of humor, dark humor
hungry|/'hʌŋgri/|adj|đói|H|I am hungry.|Tôi đang đói.|starving, famished|really hungry, go hungry
hunt|/hʌnt/|v|săn bắn|N|Hunt for food.|Săn lùng thức ăn.|search, chase|hunt down, job hunt
hurry|/'hɜ:ri/|v|vội vã|G|Hurry up!|Nhanh lên!|rush, dash|in a hurry, hurry up
hurt|/hɜ:rt/|v|làm đau|H|It hurts a lot.|Nó rất đau.|injure, pain|hurt badly, get hurt
husband|/'hʌzbənd/|n|người chồng|L|My loving husband.|Người chồng yêu quý của tôi.|spouse, partner|loving husband, ex-husband
ice|/aıs/|n|băng|N|Ice cold.|Lạnh như băng.|frost, freeze|ice cream, slip on ice
idea|/aı'di:ə/|n|ý tưởng|W|A great idea.|Một ý tưởng tuyệt vời.|concept, thought|bright idea, good idea
ideal|/aı'di:əl/|adj|lý tưởng|G|Ideal solution.|Giải pháp lý tưởng.|perfect, model|ideal candidate, ideal situation
identify|/aı'dentıfaı/|v|nhận diện|W|Identify the problem.|Nhận diện vấn đề.|recognize, name|correctly identify, identify with
identity|/aı'dentəti/|n|danh tính|G|Keep your identity safe.|Giữ an toàn danh tính của bạn.|character, personality|true identity, identity theft
ignore|/ıg'nɔ:r/|v|phớt lờ|F|Ignore the noise.|Phớt lờ tiếng ồn.|disregard, overlook|completely ignore, choose to ignore
ill|/ıl/|adj|ốm|H|Feel ill.|Cảm thấy ốm.|sick, unwell|fall ill, critically ill
illegal|/ı'li:gl/|adj|bất hợp pháp|W|Illegal drugs.|Ma túy bất hợp pháp.|unlawful, banned|strictly illegal, illegal immigrant
illness|/'ılnəs/|n|căn bệnh|H|A serious illness.|Một căn bệnh nghiêm trọng.|disease, sickness|mental illness, recover from illness
illustrate|/'ıləstreıt/|v|minh họa|W|Illustrate the point.|Minh họa cho quan điểm.|show, demonstrate|clearly illustrate, beautifully illustrated
image|/'ımıdʒ/|n|hình ảnh|W|A clear image.|Một hình ảnh rõ nét.|picture, representation|public image, body image
imaginary|/ı'mædʒıneri/|adj|tưởng tượng|E|Imaginary friend.|Người bạn tưởng tượng.|fictional, unreal|purely imaginary, imaginary world
imagination|/ı,mædʒı'neıʃən/|n|trí tưởng tượng|F|Vivid imagination.|Trí tưởng tượng phong phú.|creativity, fancy|capture the imagination, use your imagination
imagine|/ı'mædʒın/|v|tưởng tượng|F|Imagine that!|Hãy tưởng tượng xem!|visualize, suppose|hard to imagine, just imagine
immediate|/ı'mi:diət/|adj|lập tức|G|Immediate action.|Hành động lập tức.|instant, prompt|immediate effect, immediate future
immediately|/ı'mi:diətli/|adv|ngay lập tức|G|Call me immediately.|Gọi cho tôi ngay lập tức.|instantly, right away|leave immediately, act immediately
impact|/'ımpækt/|n|tác động|W|A positive impact.|Một tác động tích cực.|effect, influence|major impact, have an impact
impatient|/ım'peıʃənt/|adj|thiếu kiên nhẫn|F|Don't be impatient.|Đừng thiếu kiên nhẫn.|restless, eager|grow impatient, impatient for
import|/'ımpɔ:rt/|v|nhập khẩu|W|Import goods.|Nhập khẩu hàng hóa.|bring in, buy from abroad|import tax, rely on imports
importance|/ım'pɔ:rtns/|n|tầm quan trọng|W|The importance of education.|Tầm quan trọng của giáo dục.|significance, value|great importance, attach importance
important|/ım'pɔ:rtnt/|adj|quan trọng|W|Important meeting.|Cuộc họp quan trọng.|crucial, vital|vitally important, highly important
impossible|/ım'pa:səbl/|adj|không thể|G|Nothing is impossible.|Không gì là không thể.|unachievable, unthinkable|almost impossible, prove impossible
impress|/ım'pres/|v|gây ấn tượng|F|Impress the boss.|Gây ấn tượng với sếp.|amaze, wow|fail to impress, eager to impress
impressed|/ım'prest/|adj|bị ấn tượng|F|I am impressed.|Tôi rất ấn tượng.|awed, struck|deeply impressed, easily impressed
impression|/ım'preʃən/|n|ấn tượng|F|First impression.|Ấn tượng đầu tiên.|feeling, effect|make an impression, lasting impression
impressive|/ım'presıv/|adj|đáng ấn tượng|F|An impressive performance.|Một màn trình diễn ấn tượng.|striking, spectacular|truly impressive, highly impressive
improve|/ım'pru:v/|v|cải thiện|W|Improve your skills.|Cải thiện kỹ năng của bạn.|enhance, better|greatly improve, steadily improve
improvement|/ım'pru:vmənt/|n|sự cải thiện|W|Room for improvement.|Còn chỗ để cải thiện.|enhancement, upgrade|significant improvement, continuous improvement
in|/ın/|prep|trong|G|In the box.|Trong cái hộp.|inside, within|in the end, in fact
incident|/'ınsıdənt/|n|sự cố|G|A minor incident.|Một sự cố nhỏ.|event, occurrence|isolated incident, report an incident
include|/ın'klu:d/|v|bao gồm|G|Price includes tax.|Giá đã bao gồm thuế.|contain, involve|include everyone, deliberately include
including|/ın'klu:dıŋ/|prep|bao gồm cả|G|Everyone, including you.|Mọi người, bao gồm cả bạn.|counting, together with|up to and including, totally including
income|/'ınkʌm/|n|thu nhập|W|High income.|Thu nhập cao.|earnings, salary|source of income, low income
increase|/ın'kri:s/|v|tăng|W|Increase sales.|Tăng doanh số.|raise, boost|sharply increase, steady increase
increasingly|/ın'kri:sıŋli/|adv|ngày càng|W|Increasingly difficult.|Ngày càng khó.|progressively, more and more|increasingly popular, increasingly common
incredible|/ın'kredəbl/|adj|không thể tin được|F|An incredible story.|Một câu chuyện không thể tin được.|unbelievable, amazing|absolutely incredible, look incredible
incredibly|/ın'kredəbli/|adv|cực kỳ|F|Incredibly fast.|Cực kỳ nhanh.|extremely, highly|incredibly lucky, incredibly hard
indeed|/ın'di:d/|adv|thực sự|G|Yes, indeed.|Vâng, thực sự là vậy.|truly, actually|very much indeed, a friend indeed
independent|/ˌɪndɪˈpendənt/|adj|độc lập|F|An independent woman.|Một người phụ nữ độc lập.|free, self-reliant|fiercely independent, totally independent
indicate|/ˈɪndɪkeɪt/|v|chỉ ra|W|Indicate the direction.|Chỉ ra hướng đi.|show, point out|clearly indicate, strongly indicate
indirect|/ˌɪndəˈrekt/|adj|gián tiếp|G|Indirect impact.|Tác động gián tiếp.|roundabout, implied|indirect route, indirect reference
individual|/ˌɪndɪˈvɪdʒuəl/|adj|c cá nhân|G|Individual choice.|Sự lựa chọn cá nhân.|single, personal|individual rights, unique individual
indoor|/ˈɪndɔː/|adj|trong nhà|E|Indoor games.|Trò chơi trong nhà.|inside, interior|indoor swimming pool, indoor plants
indoors|/ˌɪnˈdɔːz/|adv|ở trong nhà|E|Stay indoors.|Ở trong nhà.|inside, within|go indoors, play indoors
industrial|/ɪnˈdʌstriəl/|adj|thuộc công nghiệp|W|Industrial area.|Khu công nghiệp.|manufacturing, commercial|industrial waste, industrial revolution
industry|/ˈɪndəstri/|n|ngành công nghiệp|W|Car industry.|Ngành công nghiệp ô tô.|business, trade|heavy industry, tourism industry
infection|/ɪnˈfekʃn/|n|sự lây nhiễm|H|Ear infection.|Nhiễm trùng tai.|disease, virus|severe infection, spread infection
influence|/ˈɪnfluəns/|n|sự ảnh hưởng|G|Under the influence.|Dưới sự ảnh hưởng.|impact, effect|strong influence, exert influence
inform|/ɪnˈfɔːm/|v|thông báo|W|Inform the manager.|Thông báo cho quản lý.|tell, notify|keep informed, officially inform
informal|/ɪnˈfɔːml/|adj|thân mật|G|Informal meeting.|Cuộc họp thân mật.|casual, relaxed|informal chat, informal setting
information|/ˌɪnfəˈmeɪʃn/|n|thông tin|W|Useful information.|Thông tin hữu ích.|data, details|valuable information, gather information
ingredient|/ɪnˈɡriːdiənt/|n|thành phần|L|Fresh ingredients.|Các thành phần tươi.|component, element|key ingredient, secret ingredient
initial|/ɪˈnɪʃl/|adj|ban đầu|G|Initial stage.|Giai đoạn ban đầu.|first, primary|initial reaction, initial cost
initially|/ɪˈnɪʃəli/|adv|lúc đầu|G|Initially I thought...|Lúc đầu tôi nghĩ...|at first, originally|initially reluctant, seem initially
initiative|/ɪˈnɪʃətɪv/|n|sáng kiến|W|Take the initiative.|Nắm lấy sáng kiến.|enterprise, drive|show initiative, local initiative
injure|/ˈɪndʒə/|v|làm bị thương|H|Injure a leg.|Làm bị thương một chân.|hurt, wound|seriously injure, severely injured
injured|/ˈɪndʒəd/|adj|bị thương|H|The injured man.|Người đàn ông bị thương.|hurt, wounded|badly injured, fatally injured
injury|/ˈɪndʒəri/|n|chấn thương|H|Severe injury.|Chấn thương nghiêm trọng.|wound, harm|head injury, suffer an injury
inner|/ˈɪnə/|adj|bên trong|G|Inner peace.|Sự bình yên bên trong.|internal, interior|inner circle, inner city
innocent|/ˈɪnəsnt/|adj|vô tội|G|An innocent man.|Một người vô tội.|guiltless, blameless|prove innocent, completely innocent
insect|/ˈɪnsekt/|n|côn trùng|N|A small insect.|Một loài côn trùng nhỏ.|bug, pest|insect bite, flying insect
inside|/ˌɪnˈsaɪd/|adv|bên trong|G|Go inside.|Đi vào bên trong.|indoors, within|step inside, deep inside
insist|/ɪnˈsɪst/|v|khăng khăng|G|I insist on it.|Tôi khăng khăng về điều đó.|demand, state|absolutely insist, keep insisting
install|/ɪnˈstɔːl/|v|cài đặt|W|Install software.|Cài đặt phần mềm.|set up, put in|install successfully, professionally installed
instance|/ˈɪnstəns/|n|ví dụ|G|For instance.|Ví dụ như.|example, case|for instance, specific instance
instead|/ɪnˈsted/|adv|thay vì|G|Instead of you.|Thay vì bạn.|alternatively, rather|do instead, use instead
institute|/ˈɪnstɪtjuːt/|n|viện|W|Research institute.|Viện nghiên cứu.|academy, organization|medical institute, technical institute
institution|/ˌɪnstɪˈtjuːʃn/|n|cơ quan|W|Financial institution.|Cơ quan tài chính.|establishment, body|educational institution, mental institution
instruction|/ɪnˈstrʌkʃn/|n|hướng dẫn|W|Follow instructions.|Làm theo hướng dẫn.|direction, order|strict instruction, clear instruction
instrument|/ˈɪnstrəmənt/|n|nhạc cụ|E|Play an instrument.|Chơi một nhạc cụ.|tool, device|musical instrument, blunt instrument
insult|/ɪnˈsʌlt/|v|xúc phạm|F|Don't insult me.|Đừng xúc phạm tôi.|offend, abuse|deliberately insult, feel insulted
insurance|/ɪnˈʃʊərəns/|n|bảo hiểm|W|Car insurance.|Bảo hiểm xe hơi.|coverage, protection|health insurance, claim insurance
intelligence|/ɪnˈtelɪdʒəns/|n|sự thông minh|F|High intelligence.|Sự thông minh cao.|intellect, cleverness|artificial intelligence, high intelligence
intelligent|/ɪnˈtelɪdʒənt/|adj|thông minh|F|Intelligent student.|Học sinh thông minh.|smart, bright|highly intelligent, very intelligent
intend|/ɪnˈtend/|v|dự định|G|I intend to go.|Tôi dự định sẽ đi.|plan, mean|fully intend, originally intended
intention|/ɪnˈtenʃn/|n|ý định|G|Good intention.|Ý định tốt.|purpose, aim|have no intention, clear intention
interest|/ˈɪntrəst/|n|sự quan tâm|F|Show interest.|Thể hiện sự quan tâm.|fascination, hobby|lose interest, express interest
interested|/ˈɪntrəstɪd/|adj|quan tâm|F|Interested in art.|Quan tâm đến nghệ thuật.|keen, curious|deeply interested, interested party
interesting|/ˈɪntrəstɪŋ/|adj|thú vị|F|An interesting book.|Một cuốn sách thú vị.|fascinating, engaging|very interesting, find it interesting
internal|/ɪnˈtɜːnl/|adj|bên trong|G|Internal organs.|Các cơ quan bên trong.|inner, domestic|internal affairs, internal bleeding
international|/ˌɪntəˈnæʃnəl/|adj|quốc tế|G|International trade.|Thương mại quốc tế.|global, worldwide|international agreement, international airport
internet|/ˈɪntənet/|n|mạng internet|W|Surf the internet.|Lướt mạng.|world wide web, net|use the internet, internet connection
interpret|/ɪnˈtɜːprɪt/|v|giải thích, thông dịch|W|Interpret a dream.|Giải mã giấc mơ.|explain, translate|hard to interpret, loosely interpreted
interrupt|/ˌɪntəˈrʌpt/|v|ngắt lời|F|Don't interrupt me.|Đừng ngắt lời tôi.|cut in, disrupt|rudely interrupt, constantly interrupt
interview|/ˈɪntəvjuː/|n|phỏng vấn|W|Job interview.|Cuộc phỏng vấn xin việc.|meeting, discussion|pass an interview, interview panel
introduce|/ˌɪntrəˈdjuːs/|v|giới thiệu|G|Introduce yourself.|Giới thiệu bản thân bạn.|present, acquaint|formally introduce, introduce a law
introduction|/ˌɪntrəˈdʌkʃn/|n|sự giới thiệu|G|A brief introduction.|Một sự giới thiệu ngắn gọn.|presentation, opening|make an introduction, brief introduction
invent|/ɪnˈvent/|v|phát minh|W|Invent a machine.|Phát minh ra máy móc.|create, design|newly invented, invent a story
invention|/ɪnˈvenʃn/|n|phát minh|W|A great invention.|Một phát minh tuyệt vời.|creation, discovery|brilliant invention, modern invention
investigate|/ɪnˈvestɪɡeɪt/|v|điều tra|W|Investigate a crime.|Điều tra một tội ác.|examine, explore|thoroughly investigate, currently investigating
investigation|/ɪnˌvestɪˈɡeɪʃn/|n|sự điều tra|W|Under investigation.|Đang bị điều tra.|inquiry, study|criminal investigation, launch an investigation
investment|/ɪnˈvestmənt/|n|sự đầu tư|W|A good investment.|Một khoản đầu tư tốt.|funding, spending|return on investment, heavy investment
invite|/ɪnˈvaɪt/|v|mời|L|Invite to a party.|Mời đến một bữa tiệc.|ask, request|warmly invite, decline an invite
involve|/ɪnˈvɒlv/|v|liên quan|G|Involve risk.|Liên quan đến rủi ro.|include, concern|heavily involve, involve someone in
involved|/ɪnˈvɒlvd/|adj|bị dính líu|G|Get involved.|Bị dính líu.|engaged, implicated|deeply involved, involved process
iron|/ˈaɪən/|n|sắt|G|Made of iron.|Làm bằng sắt.|metal, steel|iron bar, pump iron
island|/ˈaɪlənd/|n|hòn đảo|T|A desert island.|Một hòn đảo hoang vắng.|isle, atoll|tropical island, desert island
issue|/ˈɪʃuː/|n|vấn đề|G|A major issue.|Một vấn đề lớn.|problem, matter|address an issue, key issue
item|/ˈaɪtəm/|n|món đồ|L|An expensive item.|Một món đồ đắt tiền.|object, article|luxury item, single item
jacket|/ˈdʒækɪt/|n|áo khoác|L|A leather jacket.|Một chiếc áo khoác da.|coat, windbreaker|put on a jacket, leather jacket
jail|/dʒeɪl/|n|nhà tù|G|Go to jail.|Đi tù.|prison, cell|sent to jail, break out of jail
jam|/dʒæm/|n|mứt|L|Strawberry jam.|Mứt dâu tây.|preserve, jelly|traffic jam, jar of jam
job|/dʒɒb/|n|công việc|W|Find a job.|Tìm một công việc.|work, occupation|apply for a job, good job
join|/dʒɔɪn/|v|tham gia|G|Join a club.|Tham gia câu lạc bộ.|unite, connect|join in, join the army
joint|/dʒɔɪnt/|adj|chung|G|A joint account.|Một tài khoản chung.|shared, common|joint venture, joint effort
joke|/dʒəʊk/|n|trò đùa|L|Tell a joke.|Kể một câu chuyện đùa.|gag, jest|make a joke, practical joke
journal|/ˈdʒɜːnl/|n|tạp chí|W|Medical journal.|Tạp chí y khoa.|diary, magazine|keep a journal, academic journal
journalist|/ˈdʒɜːnəlɪst/|n|nhà báo|W|A famous journalist.|Một nhà báo nổi tiếng.|reporter, correspondent|investigative journalist, leading journalist
journey|/ˈdʒɜːni/|n|hành trình|T|A long journey.|Một hành trình dài.|trip, voyage|safe journey, begin a journey
joy|/dʒɔɪ/|n|niềm vui|F|Full of joy.|Tràn ngập niềm vui.|happiness, delight|tears of joy, pure joy
judge|/dʒʌdʒ/|n|thẩm phán|W|A fair judge.|Một vị thẩm phán công bằng.|magistrate, referee|panel of judges, judge harshly
judgment|/ˈdʒʌdʒmənt/|n|sự phán xét|G|Good judgment.|Sự phán xét tốt.|assessment, ruling|pass judgment, cloud your judgment
juice|/dʒuːs/|n|nước ép|L|Apple juice.|Nước ép táo.|drink, extract|fresh juice, fruit juice
jump|/dʒʌmp/|v|nhảy|E|Jump high.|Nhảy cao.|leap, bound|jump up, jump to conclusions
junior|/ˈdʒuːniə/|adj|trẻ tuổi hơn|W|Junior staff.|Nhân viên cấp dưới.|younger, lower|junior high school, junior member
just|/dʒʌst/|adv|chỉ, vừa mới|G|Just arrived.|Vừa mới đến.|only, exactly|just in time, just about
justice|/ˈdʒʌstɪs/|n|công lý|G|Demand justice.|Đòi hỏi công lý.|fairness, rightness|bring to justice, criminal justice
justify|/ˈdʒʌstɪfaɪ/|v|bào chữa|G|Justify your action.|Biện minh cho hành động.|defend, explain|hard to justify, fully justified
keen|/kiːn/|adj|say mê|F|Keen on sports.|Say mê thể thao.|eager, enthusiastic|keen interest, keen to learn
keep|/kiːp/|v|giữ|G|Keep a secret.|Giữ một bí mật.|hold, retain|keep going, keep in touch
key|/kiː/|n|chìa khóa|L|House key.|Chìa khóa nhà.|lock opener, crucial point|turn the key, key role
keyboard|/ˈkiːbɔːd/|n|bàn phím|W|Computer keyboard.|Bàn phím máy tính.|keys, input device|type on a keyboard, wireless keyboard
kick|/kɪk/|v|đá|E|Kick a ball.|Đá một quả bóng.|strike, boot|kick off, kick a habit
kid|/kɪd/|n|đứa trẻ|L|A smart kid.|Một đứa trẻ thông minh.|child, youngster|little kid, just kidding
kill|/kɪl/|v|giết|G|Kill a bug.|Giết một con rệp.|murder, destroy|kill time, pain killer
killing|/ˈkɪlɪŋ/|n|vụ giết người|G|A brutal killing.|Một vụ giết người tàn bạo.|murder, assassination|senseless killing, make a killing
kind|/kaɪnd/|adj|tử tế|F|A kind person.|Một người tử tế.|nice, generous|very kind, one of a kind
king|/kɪŋ/|n|vua|G|King of England.|Vua nước Anh.|ruler, monarch|future king, crowned king
kiss|/kɪs/|v|hôn|F|Kiss me.|Hôn tôi đi.|peck, smooch|first kiss, kiss goodbye
kitchen|/ˈkɪtʃɪn/|n|nhà bếp|L|Clean the kitchen.|Dọn dẹp nhà bếp.|cookhouse, galley|modern kitchen, kitchen sink
knee|/niː/|n|đầu gối|H|Bend your knee.|Uốn cong đầu gối.|joint, patella|fall to your knees, knee deep
knife|/naɪf/|n|con dao|L|A sharp knife.|Một con dao sắc.|blade, dagger|sharp knife, cut with a knife
knock|/nɒk/|v|gõ cửa|G|Knock on the door.|Gõ cửa.|tap, pound|knock down, knock out
knot|/nɒt/|n|nút thắt|G|Tie a knot.|Buộc một nút thắt.|tie, loop|tie a knot, untie a knot
know|/nəʊ/|v|biết|G|I know him.|Tôi biết anh ấy.|understand, recognize|know well, get to know
knowledge|/ˈnɒlɪdʒ/|n|kiến thức|W|Basic knowledge.|Kiến thức cơ bản.|understanding, wisdom|general knowledge, acquire knowledge
label|/ˈleɪbl/|n|nhãn mác|L|Read the label.|Đọc nhãn mác.|tag, sticker|designer label, price label
labor|/ˈleɪbə/|n|lao động|W|Hard labor.|Lao động chân tay.|work, effort|manual labor, child labor
laboratory|/ləˈbɒrətri/|n|phòng thí nghiệm|W|Science laboratory.|Phòng thí nghiệm khoa học.|lab, test center|clinical laboratory, laboratory tests
lack|/læk/|n|sự thiếu hụt|G|Lack of sleep.|Thiếu ngủ.|shortage, absence|complete lack, suffer a lack
lady|/ˈleɪdi/|n|quý cô|L|A nice lady.|Một quý cô tốt bụng.|woman, female|old lady, leading lady
lake|/leɪk/|n|hồ nước|N|A deep lake.|Một cái hồ sâu.|pond, reservoir|frozen lake, jump in the lake
lamp|/læmp/|n|cây đèn|L|A desk lamp.|Đèn để bàn.|light, lantern|table lamp, light a lamp
land|/lænd/|n|đất đai|N|Buy some land.|Mua một số đất đai.|ground, soil|dry land, piece of land
landscape|/ˈlændskeɪp/|n|phong cảnh|N|A beautiful landscape.|Một phong cảnh đẹp.|scenery, view|stunning landscape, urban landscape
language|/ˈlæŋɡwɪdʒ/|n|ngôn ngữ|W|Learn a language.|Học một ngôn ngữ.|tongue, speech|foreign language, body language
large|/lɑːdʒ/|adj|lớn|G|A large box.|Một cái hộp lớn.|big, huge|very large, large amount
largely|/ˈlɑːdʒli/|adv|phần lớn|G|Largely due to.|Phần lớn là do.|mostly, mainly|largely ignored, rely largely on
last|/lɑːst/|adj|cuối cùng|G|The last time.|Lần cuối cùng.|final, ultimate|last minute, last resort
late|/leɪt/|adj|muộn|G|Arrive late.|Đến muộn.|delayed, overdue|too late, run late
later|/ˈleɪtə/|adv|sau đó|G|See you later.|Hẹn gặp bạn sau.|afterwards, subsequently|much later, sooner or later
latest|/ˈleɪtɪst/|adj|mới nhất|G|Latest news.|Tin tức mới nhất.|newest, most recent|latest fashion, latest technology
laugh|/lɑːf/|v|cười|F|Make me laugh.|Làm tôi cười.|chuckle, giggle|laugh out loud, make someone laugh
law|/lɔː/|n|luật pháp|W|Break the law.|Phạm luật.|rule, regulation|by law, against the law
lawyer|/ˈlɔːjə/|n|luật sư|W|Hire a lawyer.|Thuê một luật sư.|attorney, solicitor|consult a lawyer, defense lawyer
lay|/leɪ/|v|đặt, để|G|Lay it down.|Đặt nó xuống.|put, place|lay the table, lay down
layer|/ˈleɪə/|n|lớp|G|A layer of dust.|Một lớp bụi.|level, coat|thick layer, ozone layer
lazy|/ˈleɪzi/|adj|lười biếng|F|A lazy cat.|Một con mèo lười biếng.|idle, sluggish|bone lazy, lazy Sunday
lead|/liːd/|v|dẫn dắt|W|Lead the team.|Dẫn dắt đội.|guide, direct|lead the way, lead to
leader|/ˈliːdə/|n|lãnh đạo|W|A good leader.|Một nhà lãnh đạo tốt.|head, chief|great leader, political leader
leaf|/liːf/|n|lá cây|N|A green leaf.|Một chiếc lá xanh.|frond, blade|autumn leaf, turn over a new leaf
league|/liːɡ/|n|liên đoàn|E|Football league.|Liên đoàn bóng đá.|association, alliance|major league, premier league
lean|/liːn/|v|dựa vào|G|Lean against the wall.|Dựa vào tường.|rest, tilt|lean forward, lean on
learn|/lɜːn/|v|học|W|Learn fast.|Học nhanh.|study, master|learn easily, learn by heart
learning|/ˈlɜːnɪŋ/|n|việc học|W|Learning process.|Quá trình học tập.|education, study|distance learning, lifelong learning
least|/liːst/|adv|ít nhất|G|At least once.|Ít nhất một lần.|minimum, lowest|at least, not in the least
leather|/ˈleðə/|n|da|L|Leather shoes.|Giày da.|hide, skin|genuine leather, leather jacket
leave|/liːv/|v|rời đi|G|Leave early.|Rời đi sớm.|depart, exit|leave behind, leave alone
lecture|/ˈlektʃə/|n|bài giảng|W|Attend a lecture.|Tham dự bài giảng.|speech, talk|give a lecture, boring lecture
left|/left/|adj|bên trái|G|Turn left.|Rẽ trái.|port, left-hand|on the left, left wing
leg|/leɡ/|n|chân|H|Break a leg.|Gãy một cái chân.|limb, limb|broken leg, front leg
legal|/ˈliːɡl/|adj|hợp pháp|W|Legal advice.|Lời khuyên hợp pháp.|lawful, legitimate|legal right, strictly legal
lemon|/ˈlemən/|n|quả chanh|L|Lemon juice.|Nước chanh.|citrus, sour fruit|slice of lemon, bitter lemon
lend|/lend/|v|cho mượn|G|Lend me money.|Cho tôi mượn tiền.|loan, advance|lend a hand, lend money
length|/leŋθ/|n|chiều dài|G|Measure length.|Đo chiều dài.|extent, distance|full length, great length
less|/les/|adv|ít hơn|G|Less time.|Ít thời gian hơn.|fewer, reduced|much less, less than
lesson|/ˈlesn/|n|bài học|W|A piano lesson.|Một bài học piano.|class, tutorial|valuable lesson, learn a lesson
let|/let/|v|cho phép|G|Let me go.|Hãy để tôi đi.|allow, permit|let go, let someone down
letter|/ˈletə/|n|bức thư|W|Write a letter.|Viết một bức thư.|mail, character|capital letter, send a letter
level|/ˈlevl/|n|cấp độ|W|High level.|Cấp độ cao.|standard, stage|next level, sea level
library|/ˈlaɪbrəri/|n|thư viện|W|Public library.|Thư viện công cộng.|bookhouse, archive|local library, library book
license|/ˈlaɪsns/|n|giấy phép|W|Driving license.|Giấy phép lái xe.|permit, certificate|valid license, lose your license
lie|/laɪ/|v|nói dối|F|Tell a lie.|Nói một lời nói dối.|fib, deceive|tell a lie, lie down
life|/laɪf/|n|cuộc sống|L|A good life.|Một cuộc sống tốt đẹp.|existence, being|real life, save a life
lifestyle|/ˈlaɪfstaɪl/|n|lối sống|L|Healthy lifestyle.|Lối sống lành mạnh.|way of life, habits|change your lifestyle, modern lifestyle
lift|/lɪft/|v|nâng lên|G|Lift heavy things.|Nâng vật nặng.|raise, elevate|lift up, give a lift
light|/laɪt/|n|ánh sáng|G|Turn on the light.|Bật đèn.|illumination, brightness|bright light, bring to light
like|/laɪk/|v|thích|F|I like apples.|Tôi thích táo.|enjoy, adore|really like, sound like
likely|/ˈlaɪkli/|adj|có khả năng|G|Very likely.|Rất có khả năng.|probable, expected|highly likely, more than likely
limit|/ˈlɪmɪt/|n|giới hạn|G|Speed limit.|Giới hạn tốc độ.|boundary, max|push the limit, set a limit
limited|/ˈlɪmɪtɪd/|adj|bị giới hạn|G|Limited time.|Thời gian có hạn.|restricted, finite|very limited, limited edition
line|/laɪn/|n|đường kẻ|G|Draw a line.|Vẽ một đường kẻ.|stripe, queue|straight line, draw the line
link|/lɪŋk/|n|liên kết|W|Click the link.|Nhấp vào liên kết.|connection, tie|missing link, click a link
lip|/lɪp/|n|môi|H|Bite your lip.|Cắn môi.|mouth, edge|bite your lip, read my lips
liquid|/ˈlɪkwɪd/|n|chất lỏng|G|Clear liquid.|Chất lỏng trong suốt.|fluid, solution|drink liquid, liquid form
list|/lɪst/|n|danh sách|G|Make a list.|Lập một danh sách.|inventory, record|shopping list, top of the list
listen|/ˈlɪsn/|v|lắng nghe|G|Listen to me.|Hãy lắng nghe tôi.|hear, pay attention|listen carefully, listen up
literature|/ˈlɪtrətʃə/|n|văn học|W|English literature.|Văn học tiếng Anh.|writing, books|classic literature, piece of literature
little|/ˈlɪtl/|adj|nhỏ|G|A little boy.|Một cậu bé nhỏ.|small, tiny|a little bit, little known
live|/lɪv/|v|sống|L|Live happily.|Sống hạnh phúc.|exist, reside|live long, live together
lively|/ˈlaɪvli/|adj|sôi nổi|F|A lively party.|Một bữa tiệc sôi động.|energetic, vibrant|very lively, lively debate
living|/ˈlɪvɪŋ/|n|cách sống|L|Cost of living.|Chi phí sinh hoạt.|livelihood, existing|standard of living, make a living
load|/ləʊd/|n|gánh nặng|W|A heavy load.|Một gánh nặng lớn.|burden, weight|heavy load, take a load off
loan|/ləʊn/|n|khoản vay|W|Bank loan.|Khoản vay ngân hàng.|credit, mortgage|take out a loan, student loan
local|/ˈləʊkl/|adj|địa phương|G|Local food.|Món ăn địa phương.|regional, native|local community, local hero
locate|/ləʊˈkeɪt/|v|định vị|T|Locate the place.|Định vị địa điểm.|find, pinpoint|easily locate, try to locate
located|/ləʊˈkeɪtɪd/|adj|tọa lạc|T|Located in Paris.|Tọa lạc tại Paris.|situated, placed|centrally located, beautifully located
location|/ləʊˈkeɪʃn/|n|vị trí|T|A great location.|Một vị trí tuyệt vời.|place, spot|prime location, exact location
lock|/lɒk/|v|khóa|L|Lock the door.|Khóa cửa.|secure, bolt|lock up, under lock and key
logical|/ˈlɒdʒɪkl/|adj|hợp lý|W|Logical thinking.|Suy nghĩ hợp lý.|rational, sensible|perfectly logical, logical conclusion
lonely|/ˈləʊnli/|adj|cô đơn|F|Feel lonely.|Cảm thấy cô đơn.|isolated, alone|terribly lonely, feel lonely
long|/lɒŋ/|adj|dài|G|A long road.|Một con đường dài.|lengthy, extended|all day long, as long as
look|/lʊk/|v|nhìn|G|Look at this.|Nhìn vào đây.|see, watch|look closely, look forward to
loose|/luːs/|adj|lỏng lẻo|L|Loose clothing.|Quần áo rộng thùng thình.|baggy, relaxed|hang loose, break loose
lord|/lɔːd/|n|chúa tể|G|Oh Lord!|Ôi Chúa ơi!|master, ruler|good Lord, Lord of the rings
lose|/luːz/|v|đánh mất|G|Lose my keys.|Làm mất chìa khóa.|misplace, drop|lose weight, nothing to lose
loss|/lɒs/|n|sự mất mát|G|A great loss.|Một sự mất mát lớn.|defeat, failure|terrible loss, weight loss
lost|/lɒst/|adj|bị lạc|T|Get lost.|Bị đi lạc.|missing, stray|get lost, long lost
lot|/lɒt/|pron|nhiều|G|A lot of time.|Nhiều thời gian.|bunch, plenty|a lot of, quite a lot
loud|/laʊd/|adj|to, ồn ào|G|Loud music.|Âm nhạc to.|noisy, booming|very loud, out loud
loudly|/ˈlaʊdli/|adv|một cách ồn ào|G|Speak loudly.|Nói to.|noisily, clearly|laugh loudly, complain loudly
love|/lʌv/|v|yêu|F|I love you.|Tôi yêu bạn.|adore, care for|fall in love, deeply love
lovely|/ˈlʌvli/|adj|đáng yêu|F|A lovely girl.|Một cô gái đáng yêu.|beautiful, charming|absolutely lovely, lovely day
lover|/ˈlʌvə/|n|người yêu|F|Music lover.|Người yêu âm nhạc.|admirer, partner|animal lover, secret lover
low|/ləʊ/|adj|thấp|G|Low price.|Giá thấp.|short, small|run low, low quality
lower|/ˈləʊə/|v|hạ thấp|G|Lower the volume.|Giảm âm lượng.|drop, reduce|lower your voice, lower costs
luck|/lʌk/|n|sự may mắn|F|Good luck.|Chúc may mắn.|fortune, chance|pure luck, push your luck
lucky|/ˈlʌki/|adj|may mắn|F|A lucky day.|Một ngày may mắn.|fortunate, blessed|extremely lucky, lucky strike
lump|/lʌmp/|n|cục, tảng|G|A lump of sugar.|Một cục đường.|chunk, block|lump sum, lump in throat
lunch|/lʌntʃ/|n|bữa trưa|L|Have lunch.|Ăn trưa.|midday meal|have lunch, lunch break
lung|/lʌŋ/|n|phổi|H|Lung cancer.|Bệnh ung thư phổi.|organ, breathing organ|lung cancer, top of your lungs
machine|/məˈʃiːn/|n|máy móc|W|Washing machine.|Máy giặt.|device, engine|vending machine, man and machine
machinery|/məˈʃiːnəri/|n|hệ thống máy móc|W|Heavy machinery.|Máy móc nặng.|equipment, gear|heavy machinery, operate machinery
mad|/mæd/|adj|điên, giận dữ|F|Are you mad?|Bạn có điên không?|crazy, angry|go mad, drive me mad
magazine|/ˌmæɡəˈziːn/|n|tạp chí|E|Fashion magazine.|Tạp chí thời trang.|journal, periodical|glossy magazine, magazine cover
magic|/ˈmædʒɪk/|n|ma thuật|E|Do magic tricks.|Làm trò ảo thuật.|wizardry, illusion|pure magic, magic wand
mail|/meɪl/|n|thư từ|W|Check the mail.|Kiểm tra thư từ.|post, letters|junk mail, by mail
main|/meɪn/|adj|chính|G|Main reason.|Lý do chính.|primary, principal|main course, main focus
mainly|/ˈmeɪnli/|adv|chủ yếu|G|Mainly because.|Chủ yếu là do.|mostly, primarily|consist mainly of, mainly responsible
maintain|/meɪnˈteɪn/|v|duy trì|W|Maintain quality.|Duy trì chất lượng.|keep, preserve|maintain standards, maintain contact
major|/ˈmeɪdʒə/|adj|lớn, trọng đại|G|A major problem.|Một vấn đề lớn.|significant, crucial|major role, major breakthrough
majority|/məˈdʒɒrəti/|n|đa số|G|The vast majority.|Đại đa số.|bulk, mass|vast majority, silent majority
make|/meɪk/|v|làm, chế tạo|G|Make a cake.|Làm một cái bánh.|create, produce|make a decision, make money
male|/meɪl/|n|nam giới|G|Male employees.|Nhân viên nam.|man, boy|adult male, male dominant
mall|/mɔːl/|n|trung tâm mua sắm|L|Shopping mall.|Trung tâm mua sắm.|shopping center, plaza|shopping mall, go to the mall
man|/mæn/|n|đàn ông|G|A good man.|Một người đàn ông tốt.|guy, male|young man, best man
manage|/ˈmænɪdʒ/|v|quản lý|W|Manage a team.|Quản lý một nhóm.|control, handle|manage effectively, carefully manage
management|/ˈmænɪdʒmənt/|n|sự quản lý|W|Time management.|Quản lý thời gian.|administration, control|poor management, senior management
manager|/ˈmænɪdʒə/|n|người quản lý|W|Store manager.|Người quản lý cửa hàng.|boss, director|general manager, bank manager
manner|/ˈmænə/|n|cách cư xử|L|Good manners.|Cách cư xử tốt.|way, behavior|bedside manner, all manner of
manufacture|/ˌmænjuˈfæktʃə/|v|sản xuất|W|Manufacture cars.|Sản xuất ô tô.|produce, make|manufacture goods, newly manufactured
manufacturing|/ˌmænjuˈfæktʃərɪŋ/|n|ngành sản xuất|W|Manufacturing sector.|Lĩnh vực sản xuất.|production, industry|manufacturing industry, manufacturing process
many|/ˈmeni/|det|nhiều|G|Many people.|Nhiều người.|numerous, countless|so many, too many
map|/mæp/|n|bản đồ|T|Read a map.|Đọc bản đồ.|chart, plan|street map, map out
march|/mɑːtʃ/|v|hành quân|W|Soldiers march.|Binh lính hành quân.|parade, walk|march forward, protest march
mark|/mɑːk/|n|điểm số|W|Get good marks.|Đạt điểm cao.|grade, sign|high mark, leave a mark
market|/ˈmɑːkɪt/|n|chợ|L|Super market.|Siêu thị.|bazaar, trade|target market, free market
marketing|/ˈmɑːkɪtɪŋ/|n|tiếp thị|W|Marketing plan.|Kế hoạch tiếp thị.|advertising, selling|marketing strategy, marketing campaign
marriage|/ˈmærɪdʒ/|n|hôn nhân|L|A happy marriage.|Một cuộc hôn nhân hạnh phúc.|wedlock, union|arranged marriage, happy marriage
married|/ˈmærɪd/|adj|đã kết hôn|L|A married couple.|Một cặp vợ chồng.|wedded, hitched|get married, newly married
marry|/ˈmæri/|v|kết hôn|L|Will you marry me?|Bạn sẽ kết hôn với tôi chứ?|wed, tie the knot|marry young, decide to marry
mass|/mæs/|n|khối lượng lớn|G|Mass destruction.|Sự hủy diệt hàng loạt.|bulk, load|mass media, mass production
massive|/ˈmæsɪv/|adj|to lớn|G|A massive building.|Một tòa nhà to lớn.|huge, giant|massive scale, massive heart attack
master|/ˈmɑːstə/|n|bậc thầy|W|A master chef.|Một vị đầu bếp bậc thầy.|expert, boss|master of, past master
match|/mætʃ/|n|trận đấu|E|Football match.|Trận đấu bóng đá.|game, competition|perfect match, win a match
matching|/ˈmætʃɪŋ/|adj|đồng bộ, phù hợp|G|Matching colors.|Màu sắc phù hợp.|identical, corresponding|matching pair, matching outfit
material|/məˈtɪəriəl/|n|vật liệu|G|Building materials.|Vật liệu xây dựng.|substance, matter|raw material, reading material
mathematics|/ˌmæθəˈmætɪks/|n|toán học|W|Study mathematics.|Học toán học.|math, calculus|pure mathematics, applied mathematics
matter|/ˈmætə/|n|vấn đề|G|It doesn't matter.|Điều đó không quan trọng.|issue, subject|no matter what, make matters worse
maximum|/ˈmæksɪməm/|adj|tối đa|G|Maximum speed.|Tốc độ tối đa.|highest, top|maximum amount, maximum security
may|/meɪ/|modal|có thể|G|I may go.|Tôi có thể sẽ đi.|might, can|come what may, be that as it may
maybe|/ˈmeɪbi/|adv|có lẽ|G|Maybe tomorrow.|Có lẽ là ngày mai.|perhaps, possibly|just maybe, think maybe
mayor|/meə/|n|thị trưởng|W|The city mayor.|Thị trưởng thành phố.|official, leader|local mayor, elect a mayor
meal|/miːl/|n|bữa ăn|L|A delicious meal.|Một bữa ăn ngon.|feast, repast|heavy meal, enjoy a meal
mean|/miːn/|v|có ý nghĩa|G|What do you mean?|Ý bạn là gì?|signify, indicate|exactly mean, mean well
meaning|/ˈmiːnɪŋ/|n|ý nghĩa|G|Meaning of life.|Ý nghĩa cuộc sống.|significance, definition|hidden meaning, deeper meaning
means|/miːns/|n|phương tiện|G|Means of transport.|Phương tiện giao thông.|method, way|by no means, means of communication
meanwhile|/ˈmiːnwaɪl/|adv|trong khi đó|G|Meanwhile, I waited.|Trong khi đó, tôi đã đợi.|in the meantime, concurrently|meanwhile back at, happen meanwhile
measure|/ˈmeʒə/|v|đo lường|G|Measure the length.|Đo chiều dài.|calculate, gauge|carefully measure, measure up
measurement|/ˈmeʒəmənt/|n|sự đo lường|G|Accurate measurement.|Sự đo lường chính xác.|calculation, dimension|precise measurement, take measurements
meat|/miːt/|n|thịt|L|Eat meat.|Ăn thịt.|flesh, protein|red meat, raw meat
mechanic|/məˈkænɪk/|n|thợ cơ khí|W|A car mechanic.|Một thợ cơ khí ô tô.|technician, repairman|skilled mechanic, chief mechanic
mechanical|/məˈkænɪkl/|adj|thuộc cơ khí|W|Mechanical problem.|Vấn đề cơ khí.|automated, machine-driven|mechanical failure, mechanical engineering
mechanism|/ˈmekənɪzəm/|n|cơ chế|W|Defense mechanism.|Cơ chế phòng thủ.|system, process|complex mechanism, coping mechanism
media|/ˈmiːdiə/|n|phương tiện truyền thông|W|Social media.|Mạng xã hội.|press, broadcasting|mass media, media coverage
medical|/ˈmedɪkl/|adj|thuộc y tế|H|Medical care.|Chăm sóc y tế.|clinical, health|medical treatment, medical history
medicine|/ˈmedsn/|n|thuốc|H|Take medicine.|Uống thuốc.|pill, drug|modern medicine, take medicine
medium|/ˈmiːdiəm/|adj|trung bình|G|Medium size.|Kích thước trung bình.|average, standard|medium rare, medium height
meet|/miːt/|v|gặp gỡ|G|Meet a friend.|Gặp một người bạn.|encounter, gather|meet up, nice to meet you
meeting|/ˈmiːtɪŋ/|n|cuộc họp|W|A business meeting.|Một cuộc họp kinh doanh.|gathering, conference|arrange a meeting, board meeting
melt|/melt/|v|tan chảy|N|Ice melts.|Đá tan chảy.|thaw, dissolve|melt away, melt into
member|/ˈmembə/|n|thành viên|G|Family member.|Thành viên gia đình.|participant, associate|founding member, gang member
memory|/ˈmeməri/|n|trí nhớ|H|Good memory.|Trí nhớ tốt.|recall, remembrance|short-term memory, photographic memory
mental|/ˈmentl/|adj|tinh thần|H|Mental health.|Sức khỏe tinh thần.|psychological, intellectual|mental illness, mental block
mentally|/ˈmentəli/|adv|về mặt tinh thần|H|Mentally ill.|Bệnh tâm thần.|psychologically, intellectually|mentally exhausted, mentally prepared
mention|/ˈmenʃn/|v|đề cập|G|Don't mention it.|Đừng bận tâm.|state, remark|briefly mention, fail to mention
menu|/ˈmenjuː/|n|thực đơn|L|Look at the menu.|Xem thực đơn.|list, bill of fare|ask for the menu, menu bar
mere|/mɪə/|adj|chỉ là|G|A mere child.|Chỉ là một đứa trẻ.|bare, simple|mere fact, mere fraction
merely|/ˈmɪəli/|adv|chỉ|G|Merely a joke.|Chỉ là một trò đùa.|simply, just|not merely, merely because
mess|/mes/|n|tình trạng lộn xộn|L|What a mess!|Thật lộn xộn!|chaos, disorder|make a mess, terrible mess
message|/ˈmesɪdʒ/|n|tin nhắn|W|Send a message.|Gửi một tin nhắn.|note, memo|text message, leave a message
metal|/ˈmetl/|n|kim loại|G|Made of metal.|Làm bằng kim loại.|alloy, steel|heavy metal, sheet of metal
method|/ˈmeθəd/|n|phương pháp|W|A new method.|Một phương pháp mới.|way, technique|effective method, traditional method
middle|/ˈmɪdl/|n|ở giữa|G|In the middle.|Ở giữa.|center, core|middle age, right in the middle
midnight|/ˈmɪdnaɪt/|n|nửa đêm|G|At midnight.|Vào nửa đêm.|dead of night|after midnight, until midnight
mild|/maɪld/|adj|ôn hòa|N|Mild weather.|Thời tiết ôn hòa.|gentle, soft|mild winter, mild flavor
mile|/maɪl/|n|dặm|T|Walk a mile.|Đi bộ một dặm.|distance|miles away, miles per hour
military|/ˈmɪlətri/|adj|thuộc quân đội|W|Military base.|Căn cứ quân sự.|armed, martial|military service, military action
milk|/mɪlk/|n|sữa|L|Drink milk.|Uống sữa.|dairy|glass of milk, cow's milk
mill|/mɪl/|n|cối xay, nhà máy|W|A paper mill.|Một nhà máy giấy.|factory, plant|steel mill, run of the mill
mind|/maɪnd/|n|tâm trí|H|Keep in mind.|Hãy ghi nhớ.|brain, intellect|change your mind, out of your mind
mine|/maɪn/|pron|của tôi|G|It is mine.|Nó là của tôi.|my own|friend of mine, yours and mine
mineral|/ˈmɪnərəl/|n|khoáng chất|N|Mineral water.|Nước khoáng.|substance, rock|mineral wealth, trace minerals
minimum|/ˈmɪnɪməm/|adj|tối thiểu|G|Minimum wage.|Mức lương tối thiểu.|least, lowest|minimum requirement, bare minimum
minister|/ˈmɪnɪstə/|n|bộ trưởng|W|Prime minister.|Thủ tướng.|official, cleric|cabinet minister, health minister
ministry|/ˈmɪnɪstri/|n|bộ (chính phủ)|W|Ministry of Education.|Bộ giáo dục.|department, government|defense ministry, ministry of health
minor|/ˈmaɪnə/|adj|nhỏ, không quan trọng|G|A minor injury.|Một chấn thương nhỏ.|small, slight|minor detail, minor problem
minority|/maɪˈnɒrəti/|n|thiểu số|G|A small minority.|Một thiểu số nhỏ.|fraction|ethnic minority, tiny minority
minute|/ˈmɪnɪt/|n|phút|G|Wait a minute.|Đợi một phút.|sixty seconds|just a minute, last minute
mirror|/ˈmɪrə/|n|chiếc gương|L|Look in the mirror.|Nhìn vào gương.|glass, reflector|look in the mirror, rear-view mirror
miss|/mɪs/|v|bỏ lỡ, nhớ|F|I miss you.|Tôi nhớ bạn.|skip, lose|miss a flight, miss an opportunity
missing|/ˈmɪsɪŋ/|adj|mất tích|G|A missing child.|Một đứa trẻ mất tích.|lost, gone|go missing, report missing
mistake|/mɪˈsteɪk/|n|sai lầm|G|Make a mistake.|Mắc sai lầm.|error, fault|terrible mistake, learn from mistakes
mix|/mɪks/|v|trộn|L|Mix the colors.|Trộn các màu lại.|blend, combine|mix well, mix up
mixed|/mɪkst/|adj|lẫn lộn|G|Mixed feelings.|Cảm xúc lẫn lộn.|blended, assorted|mixed reaction, mixed blessing
mixture|/ˈmɪkstʃə/|n|hỗn hợp|G|A mixture of sand and water.|Một hỗn hợp cát và nước.|blend, combination|complex mixture, strange mixture
mobile|/ˈməʊbaɪl/|adj|di động|W|Mobile phone.|Điện thoại di động.|portable, moving|mobile device, upwardly mobile
mode|/məʊd/|n|chế độ|W|Sleep mode.|Chế độ ngủ.|method, style|survival mode, stealth mode
model|/ˈmɒdl/|n|người mẫu|E|A fashion model.|Một người mẫu thời trang.|example, replica|role model, latest model
modern|/ˈmɒdn/|adj|hiện đại|G|Modern art.|Nghệ thuật hiện đại.|contemporary, new|modern technology, modern life
mom|/mɒm/|n|mẹ|L|My mom.|Mẹ của tôi.|mother|stay-at-home mom, soccer mom
moment|/ˈməʊmənt/|n|khoảnh khắc|G|Wait a moment.|Chờ một lát.|instant, second|at the moment, spare a moment
money|/ˈmʌni/|n|tiền|L|Earn money.|Kiếm tiền.|cash, wealth|save money, waste of money
monitor|/ˈmɒnɪtə/|n|màn hình|W|Computer monitor.|Màn hình máy tính.|screen, display|closely monitor, heart monitor
month|/mʌnθ/|n|tháng|G|Next month.|Tháng tới.|thirty days|every month, a month ago
mood|/muːd/|n|tâm trạng|F|In a good mood.|Trong tâm trạng tốt.|temper, feeling|bad mood, swing in mood
moon|/muːn/|n|mặt trăng|N|The full moon.|Mặt trăng tròn.|satellite|full moon, over the moon
moral|/ˈmɒrəl/|adj|thuộc đạo đức|F|Moral values.|Các giá trị đạo đức.|ethical, good|moral support, moral obligation
morally|/ˈmɒrəli/|adv|về mặt đạo đức|F|Morally wrong.|Sai trái về mặt đạo đức.|ethically, virtuously|morally acceptable, morally bankrupt
more|/mɔː/|adv|nhiều hơn|G|More time.|Nhiều thời gian hơn.|extra, added|more and more, nothing more
moreover|/mɔːrˈəʊvə/|adv|hơn thế nữa|G|Moreover, it is cheap.|Hơn nữa, nó rất rẻ.|furthermore, besides|and moreover, but moreover
morning|/ˈmɔːnɪŋ/|n|buổi sáng|G|Good morning.|Chào buổi sáng.|dawn, a.m.|early morning, tomorrow morning
mouse|/maʊs/|n|con chuột|N|Computer mouse.|Chuột máy tính.|rodent|click the mouse, quiet as a mouse
mouth|/maʊθ/|n|miệng|H|Open your mouth.|Mở miệng ra.|lips, jaw|open your mouth, word of mouth
move|/muːv/|v|di chuyển|G|Move the box.|Di chuyển cái hộp.|shift, transfer|move away, move on
movement|/ˈmuːvmənt/|n|sự chuyển động|G|Slow movement.|Chuyển động chậm.|motion, shift|political movement, eye movement
movie|/ˈmuːvi/|n|bộ phim|E|Watch a movie.|Xem một bộ phim.|film, cinema|go to the movies, movie star
much|/mʌtʃ/|adv|nhiều|G|Thank you very much.|Cảm ơn bạn rất nhiều.|a lot, highly|too much, so much
mud|/mʌd/|n|bùn|N|Stuck in the mud.|Bị kẹt trong bùn.|dirt, clay|thick mud, covered in mud
multiply|/ˈmʌltɪplaɪ/|v|nhân lên|W|Multiply by two.|Nhân với hai.|increase, breed|multiply rapidly, multiply together
murder|/ˈmɜːdə/|n|giết người|L|A murder mystery.|Một vụ bí ẩn giết người.|killing, assassination|commit murder, get away with murder
muscle|/ˈmʌsl/|n|cơ bắp|H|Build muscle.|Xây dựng cơ bắp.|brawn, strength|pull a muscle, muscle pain
museum|/mjuˈziːəm/|n|bảo tàng|E|Visit a museum.|Thăm một bảo tàng.|gallery, exhibition|national museum, art museum
music|/ˈmjuːzɪk/|n|âm nhạc|E|Listen to music.|Nghe nhạc.|tunes, melody|classical music, pop music
musical|/ˈmjuːzɪkl/|adj|thuộc âm nhạc|E|Musical instrument.|Nhạc cụ.|melodic, tuneful|musical talent, musical instrument
musician|/mjuˈzɪʃn/|n|nhạc sĩ|E|A famous musician.|Một nhạc sĩ nổi tiếng.|player, performer|gifted musician, professional musician
must|/mʌst/|modal|phải|G|You must go.|Bạn phải đi.|have to, ought to|a must-have, absolutely must
mystery|/ˈmɪstri/|n|điều bí ẩn|E|Solve the mystery.|Giải quyết điều bí ẩn.|secret, puzzle|unsolved mystery, shroud of mystery
year|/jɪə/|n|năm|G|Happy New Year.|Chúc mừng năm mới.|twelve months|all year round, leap year
yellow|/ˈjeləʊ/|adj|màu vàng|G|A yellow car.|Một chiếc ô tô màu vàng.|golden, blonde|bright yellow, pale yellow
yes|/jes/|adv|có, vâng|G|Yes, please.|Vâng, làm ơn.|yeah, absolutely|say yes, yes indeed
yesterday|/ˈjestədeɪ/|adv|hôm qua|G|I saw him yesterday.|Tôi đã gặp anh ấy hôm qua.|the day before|only yesterday, yesterday morning
yet|/jet/|adv|vẫn chưa|G|Not yet.|Vẫn chưa.|still, so far|have yet to, as yet
you|/ju/|pron|bạn|G|I love you.|Tôi yêu bạn.|yourself|you guys, thank you
young|/jʌŋ/|adj|trẻ|G|A young boy.|Một cậu bé trẻ.|youthful, immature|young people, when I was young
your|/jɔː/|det|của bạn|G|Your book.|Sách của bạn.|belonging to you|your own, your majesty
yours|/jɔːz/|pron|của bạn|G|This is yours.|Cái này là của bạn.|your one|sincerely yours, a friend of yours
yourself|/jɔːˈself/|pron|tự bạn|G|Do it yourself.|Tự bạn làm đi.|you personally|by yourself, look after yourself
youth|/juːθ/|n|tuổi trẻ|G|In my youth.|Trong thời trẻ của tôi.|young days, teens|youth culture, youth club
zone|/zəʊn/|n|khu vực|G|A danger zone.|Một khu vực nguy hiểm.|area, region|comfort zone, time zone
zoo|/zuː/|n|sở thú|E|Visit the zoo.|Thăm sở thú.|animal park|go to the zoo, zoo keeper`.trim();

// Parse vocabulary using shared utility
const fullVocabulary = parseB1B2(rawString);

// Export for use by ExaminePage
export { fullVocabulary as b2Vocabulary };

const B2Vocabulary = () => {
  const [activeTab, setActiveTab] = useState('flashcard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState('All');
  const [currentFlashcard, setCurrentFlashcard] = useState(() => {
    const saved = localStorage.getItem('b2_flashcard_progress');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('b2_flashcard_progress', currentFlashcard);
  }, [currentFlashcard]);
  const [isFlipped, setIsFlipped] = useState(false);

  // AI Modal States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiCurrentWord, setAiCurrentWord] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [userSentence, setUserSentence] = useState('');
  const [isPronounceModalOpen, setIsPronounceModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);




  // Trạng thái từ đã học
  const [showLearned, setShowLearned] = useState(false);
  const [learnedWords, setLearnedWords] = useState(() => {
    const saved = localStorage.getItem('b2_learned_words');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('b2_learned_words', JSON.stringify(learnedWords));
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

  // Trạng thái từ yêu thích
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteWords, setFavoriteWords] = useState(() => {
    const saved = localStorage.getItem('b2_favorite_words');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('b2_favorite_words', JSON.stringify(favoriteWords));
  }, [favoriteWords]);

  const toggleFavorite = (e, word) => {
    e.stopPropagation();
    setFavoriteWords(prev => {
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
    'All': { label: 'Tất cả', icon: <LayoutGrid className="w-4 h-4" />, color: 'bg-emerald-600' },
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

  // Lọc từ vựng
  const filteredVocab = useMemo(() => {
    return fullVocabulary.filter(item => {
      const matchesSearch = item.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTopic = filterTopic === 'All' || item.topic === filterTopic;
      const matchesLearned = showLearned || !learnedWords.includes(item.word);
      const matchesFavorite = !showFavorites || favoriteWords.includes(item.word);
      return matchesSearch && matchesTopic && matchesLearned && matchesFavorite;
    });
  }, [searchQuery, filterTopic, learnedWords, showLearned, showFavorites, favoriteWords]);


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

  // --- AI Handlers ---
  const handleOpenAiModal = (wordObj) => {
    setAiCurrentWord(wordObj);
    setIsAiModalOpen(true);
    setAiResponse('');
    setUserSentence('');
  };

  const handleOpenPronounce = (wordObj) => {
    setAiCurrentWord(wordObj);
    setIsPronounceModalOpen(true);
  };

  const handleExplainWord = async (wordObj, lang = 'vi') => {
    const cacheKey = `ai_explain_b2_${wordObj.word}_${lang}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      setAiResponse(cached);
      return;
    }

    setIsAiLoading(true);
    setAiResponse('');
    
    let prompt;
    if (lang === 'vi') {
      prompt = `Hãy giải thích chi tiết cách sử dụng từ tiếng Anh "${wordObj.word}" (từ loại: ${wordObj.pos}, nghĩa: ${wordObj.meaning}). Cung cấp 2 ví dụ thực tế kèm lời dịch, và chỉ ra các sắc thái nghĩa hoặc lỗi sai thường gặp khi dùng từ này ở trình độ B2. Trình bày ngắn gọn, dễ hiểu.`;
    } else {
      prompt = `Provide a sophisticated explanation of the English word "${wordObj.word}" (pos: ${wordObj.pos}, meaning: ${wordObj.meaning}) for a B2 learner. Include nuances, collocations, and 2 advanced examples with Vietnamese translations. Highlight common pitfalls or academic usage. Respond ONLY in English for the explanation parts.`;
    }
    
    let fullResponse = '';
    await callAIStream(prompt, (chunk) => {
      setIsAiLoading(false);
      fullResponse += chunk;
      setAiResponse(fullResponse);
    });

    if (fullResponse.trim()) {
      localStorage.setItem(cacheKey, fullResponse);
    }
  };

  const handleCheckSentence = async () => {
    if (!userSentence.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');
    const prompt = `Tôi đang học từ tiếng Anh "${aiCurrentWord.word}". Đánh giá câu sau của tôi: "${userSentence}". Hãy chỉ ra lỗi ngữ pháp hoặc cách dùng từ (nếu có), giải thích lý do, và đề xuất 1-2 cách viết tự nhiên hơn. Trình bày ngắn gọn, thân thiện.`;
    
    let fullResponse = '';
    await callAIStream(prompt, (chunk) => {
      setIsAiLoading(false);
      fullResponse += chunk;
      setAiResponse(fullResponse);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-10">

      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-10">
        <div className="mb-8 space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" placeholder="Tra cứu từ vựng, nghĩa, hoặc từ đồng nghĩa..." 
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none shadow-sm transition-all text-sm sm:text-base"
                value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentFlashcard(0); }}
              />
            </div>

            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className="px-5 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <Filter className="w-5 h-5" /> <span className="hidden sm:inline">Bộ lọc</span>
            </button>
          </div>
        </div>

        {filteredVocab.length > 0 && (
          <div className="flex flex-col items-center py-4 md:py-6 gap-6 md:gap-8">

            <div 
              className={`relative w-full max-w-md h-[min(450px,60vh)] cursor-pointer transition-all duration-700 preserve-3d group ${isFlipped ? 'rotate-y-180' : ''}`}
              onClick={() => { setIsFlipped(!isFlipped); playSound('click'); }}
              style={{ perspective: '1200px' }}
            >
              <div className={`absolute inset-0 bg-white rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-8 md:p-10 border-4 border-white ring-1 ring-slate-100 backface-hidden ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
                <div className="absolute top-5 left-5 md:top-6 md:left-6 bg-slate-100 text-slate-400 px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-black tracking-widest uppercase">
                  {currentFlashcard + 1} / {filteredVocab.length}
                </div>
                <button 
                  onClick={(e) => toggleFavorite(e, filteredVocab[currentFlashcard].word)}
                  className="absolute top-5 right-5 md:top-6 md:right-6 bg-slate-100 p-2.5 rounded-xl transition-all hover:scale-110 active:scale-90 shadow-sm"
                >
                  <Heart className={`w-5 h-5 ${favoriteWords.includes(filteredVocab[currentFlashcard].word) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                </button>
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
                className={`absolute inset-0 bg-emerald-600 rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-6 md:p-8 text-white backface-hidden transform rotate-y-180 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className="absolute top-5 right-5 md:top-6 md:right-6 bg-white/20 text-white px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-black tracking-widest uppercase">
                  {currentFlashcard + 1} / {filteredVocab.length}
                </div>
                <span className="text-emerald-200 text-xs font-black uppercase mb-2 tracking-widest">{topicConfig[filteredVocab[currentFlashcard].topic].label}</span>
                <h3 className="text-3xl font-black mb-4 text-center leading-tight underline decoration-emerald-300 underline-offset-8">{filteredVocab[currentFlashcard].meaning}</h3>
                
                <div className="w-full flex flex-col gap-1.5 mb-4 bg-emerald-700/50 p-4 rounded-2xl text-left border border-emerald-500/30">
                  <p className="text-[13px]"><span className="font-bold text-emerald-200">🔗 Đồng nghĩa:</span> {filteredVocab[currentFlashcard].synonyms}</p>
                  <p className="text-[13px]"><span className="font-bold text-emerald-200">📝 Cụm từ hay:</span> {filteredVocab[currentFlashcard].collocations}</p>
                </div>

                <p className="italic text-emerald-50 text-[15px] text-center mb-2 font-medium px-2 leading-relaxed">"{filteredVocab[currentFlashcard].example}"</p>
                <p className="text-[11px] text-emerald-200 text-center font-bold tracking-wider uppercase opacity-90">{filteredVocab[currentFlashcard].translation}</p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-5 items-center flex-wrap justify-center">
              <button 
                disabled={currentFlashcard === 0} 
                onClick={() => { setCurrentFlashcard(prev => prev - 1); setIsFlipped(false); playSound('click'); }} 
                className="p-3 sm:p-4 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 disabled:opacity-30 transition-all shadow-lg active:scale-95"
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
              <button 
                onClick={() => speak(filteredVocab[currentFlashcard].word)} 
                className="p-3 sm:p-4 rounded-full bg-white border border-slate-200 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all shadow-lg active:scale-95"
                title="Nghe"
              >
                <Volume2 className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
              <button 
                onClick={() => handleOpenPronounce(filteredVocab[currentFlashcard])}
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-black shadow-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 ring-4 sm:ring-8 bg-rose-600 text-white hover:bg-rose-700 ring-rose-50"
              >
                <Mic className="w-5 h-5" /> PHÁT ÂM
              </button>
              <button 
                onClick={() => handleOpenAiModal(filteredVocab[currentFlashcard])}
                className="p-3 sm:p-4 rounded-full bg-white border border-slate-200 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-lg active:scale-95"
                title="Hỏi AI"
              >
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
              <button 
                disabled={currentFlashcard === filteredVocab.length - 1} 
                onClick={() => { setCurrentFlashcard(prev => prev + 1); setIsFlipped(false); playSound('click'); }} 
                className="p-3 sm:p-4 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 disabled:opacity-30 transition-all shadow-lg active:scale-95"
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
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
        themeColor="emerald"
      />
      
      <PronunciationModal 
        isOpen={isPronounceModalOpen}
        onClose={() => setIsPronounceModalOpen(false)}
        wordObj={aiCurrentWord}
        themeColor="emerald"
      />

      <FilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        topics={topics}
        topicConfig={topicConfig}
        filterTopic={filterTopic}
        onTopicSelect={(topic) => {
          setFilterTopic(topic);
          setCurrentFlashcard(0);
          setIsFilterModalOpen(false);
          playSound('select');
        }}
        showLearned={showLearned}
        onToggleLearned={() => {
          setShowLearned(!showLearned);
          setCurrentFlashcard(0);
          playSound('click');
        }}
        showFavorites={showFavorites}
        onToggleFavorites={() => {
          setShowFavorites(!showFavorites);
          setCurrentFlashcard(0);
          playSound('click');
        }}
        themeColor="emerald"
      />

      <footer className="max-w-6xl mx-auto px-6 py-10 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-300 font-black tracking-widest uppercase text-xs">
          <BookOpen className="w-4 h-4" />
          B2 Level Vocabulary • AI Assistant
        </div>
      </footer>

    </div>
  );
};

export default B2Vocabulary;
