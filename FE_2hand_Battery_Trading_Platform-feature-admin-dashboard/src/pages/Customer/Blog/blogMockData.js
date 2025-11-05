// Mock data for blog posts
export const mockBlogPosts = [
  {
    id: 1,
    title: "Hướng dẫn chọn mua xe máy điện phù hợp cho sinh viên",
    slug: "huong-dan-chon-mua-xe-may-dien-phu-hop-cho-sinh-vien",
    excerpt: "Xe máy điện đang trở thành xu hướng di chuyển phổ biến cho sinh viên. Bài viết này sẽ giúp bạn lựa chọn được chiếc xe phù hợp nhất.",
    content: `
      <h2>Tại sao sinh viên nên chọn xe máy điện?</h2>
      <p>Xe máy điện đang ngày càng được ưa chuộng bởi nhiều ưu điểm vượt trội như tiết kiệm chi phí, thân thiện với môi trường và dễ dàng bảo dưỡng.</p>
      
      <h3>1. Chi phí vận hành thấp</h3>
      <p>So với xe xăng truyền thống, xe máy điện giúp tiết kiệm đến 80% chi phí nhiên liệu. Với sinh viên, đây là yếu tố quan trọng để cân nhắc.</p>
      
      <h3>2. Thân thiện với môi trường</h3>
      <p>Xe điện không thải khí CO2, góp phần bảo vệ môi trường và sức khỏe cộng đồng.</p>
      
      <h3>3. Bảo dưỡng đơn giản</h3>
      <p>Không cần thay nhớt, lọc gió hay các chi tiết phức tạp như xe xăng, giúp tiết kiệm thời gian và chi phí bảo dưỡng.</p>
      
      <h2>Các yếu tố cần xem xét khi mua xe</h2>
      <ul>
        <li><strong>Quãng đường di chuyển hàng ngày:</strong> Chọn xe có dung lượng pin phù hợp</li>
        <li><strong>Ngân sách:</strong> Xác định mức giá phù hợp với khả năng tài chính</li>
        <li><strong>Thương hiệu uy tín:</strong> Ưu tiên các hãng xe có bảo hành tốt</li>
        <li><strong>Trạm sạc gần nhà/trường:</strong> Đảm bảo thuận tiện cho việc sạc điện</li>
      </ul>
      
      <h2>Top 5 xe máy điện phù hợp cho sinh viên 2025</h2>
      <p>Dựa trên khảo sát thị trường, đây là 5 dòng xe được sinh viên ưa chuộng nhất:</p>
      <ol>
        <li>VinFast Evo200 - Thiết kế trẻ trung, giá cả phải chăng</li>
        <li>Yadea Xmen Neo - Pin bền, công suất mạnh</li>
        <li>Pega Cap A - Nhỏ gọn, dễ di chuyển trong thành phố</li>
        <li>DaBi Mocha - Thiết kế sang trọng, nhiều tính năng thông minh</li>
        <li>Anbico AP1518 - Giá rẻ, phù hợp sinh viên</li>
      </ol>
      
      <h2>Kết luận</h2>
      <p>Việc chọn mua xe máy điện phù hợp sẽ giúp bạn tiết kiệm chi phí và có trải nghiệm di chuyển tốt hơn trong suốt quãng thời gian học tập. Hãy cân nhắc kỹ các yếu tố trên để đưa ra quyết định đúng đắn!</p>
    `,
    author: {
      name: "Nguyễn Văn An",
      avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+An&background=00c9a7&color=fff",
      role: "Chuyên gia xe điện"
    },
    category: "Hướng dẫn",
    tags: ["xe điện", "sinh viên", "mua xe"],
    thumbnail: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=500&fit=crop",
    publishedAt: "2025-10-20T10:00:00Z",
    views: 1234,
    readTime: 5,
    featured: true
  },
  {
    id: 2,
    title: "So sánh pin Lithium và pin Acid - Nên chọn loại nào?",
    slug: "so-sanh-pin-lithium-va-pin-acid",
    excerpt: "Phân tích chi tiết ưu nhược điểm của hai loại pin phổ biến nhất hiện nay để giúp bạn đưa ra lựa chọn phù hợp.",
    content: `
      <h2>Giới thiệu về Pin Lithium và Pin Acid</h2>
      <p>Hai loại pin phổ biến nhất trên thị trường xe điện hiện nay là pin Lithium và pin Acid. Mỗi loại đều có ưu nhược điểm riêng.</p>
      
      <h3>Pin Lithium (Li-ion)</h3>
      <p><strong>Ưu điểm:</strong></p>
      <ul>
        <li>Trọng lượng nhẹ hơn 3-4 lần so với pin Acid</li>
        <li>Tuổi thọ cao (5-7 năm)</li>
        <li>Sạc nhanh, hiệu suất cao</li>
        <li>Không cần bảo dưỡng định kỳ</li>
      </ul>
      <p><strong>Nhược điểm:</strong></p>
      <ul>
        <li>Giá thành cao hơn 2-3 lần</li>
        <li>Cần bảo vệ mạch sạc/xả chuyên dụng</li>
      </ul>
      
      <h3>Pin Acid (Lead-acid)</h3>
      <p><strong>Ưu điểm:</strong></p>
      <ul>
        <li>Giá thành rẻ</li>
        <li>Công nghệ ổn định, dễ thay thế</li>
        <li>An toàn khi sử dụng</li>
      </ul>
      <p><strong>Nhược điểm:</strong></p>
      <ul>
        <li>Nặng nề, cồng kềnh</li>
        <li>Tuổi thọ thấp (2-3 năm)</li>
        <li>Cần bảo dưỡng thường xuyên</li>
        <li>Thời gian sạc lâu</li>
      </ul>
      
      <h2>Bảng so sánh chi tiết</h2>
      <table>
        <tr>
          <th>Tiêu chí</th>
          <th>Pin Lithium</th>
          <th>Pin Acid</th>
        </tr>
        <tr>
          <td>Giá thành ban đầu</td>
          <td>15-25 triệu</td>
          <td>5-8 triệu</td>
        </tr>
        <tr>
          <td>Tuổi thọ</td>
          <td>5-7 năm</td>
          <td>2-3 năm</td>
        </tr>
        <tr>
          <td>Trọng lượng</td>
          <td>8-12 kg</td>
          <td>30-40 kg</td>
        </tr>
        <tr>
          <td>Thời gian sạc</td>
          <td>2-3 giờ</td>
          <td>6-8 giờ</td>
        </tr>
      </table>
      
      <h2>Nên chọn loại pin nào?</h2>
      <p><strong>Chọn pin Lithium nếu:</strong> Bạn sử dụng xe thường xuyên, di chuyển quãng đường dài, và có ngân sách đầu tư ban đầu tốt.</p>
      <p><strong>Chọn pin Acid nếu:</strong> Ngân sách hạn chế, sử dụng xe không thường xuyên, và chấp nhận việc bảo dưỡng định kỳ.</p>
    `,
    author: {
      name: "Trần Thị Bình",
      avatar: "https://ui-avatars.com/api/?name=Tran+Thi+Binh&background=00c9a7&color=fff",
      role: "Kỹ sư pin"
    },
    category: "Công nghệ",
    tags: ["pin", "lithium", "acid", "so sánh"],
    thumbnail: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=500&fit=crop",
    publishedAt: "2025-10-18T14:30:00Z",
    views: 987,
    readTime: 7,
    featured: true
  },
  {
    id: 3,
    title: "10 mẹo giúp tăng tuổi thọ pin xe máy điện",
    slug: "10-meo-tang-tuoi-tho-pin-xe-may-dien",
    excerpt: "Những mẹo đơn giản nhưng hiệu quả giúp bạn kéo dài tuổi thọ pin và tiết kiệm chi phí thay thế.",
    content: `
      <h2>Tại sao cần quan tâm đến tuổi thọ pin?</h2>
      <p>Pin là bộ phận đắt tiền nhất của xe máy điện, chiếm 40-50% giá trị xe. Việc bảo dưỡng đúng cách giúp tiết kiệm hàng triệu đồng chi phí thay thế.</p>
      
      <h2>10 mẹo hữu ích</h2>
      
      <h3>1. Sạc pin đúng cách</h3>
      <p>Nên sạc khi pin còn 20-30%, tránh để pin hết hoàn toàn. Không sạc qua đêm.</p>
      
      <h3>2. Tránh sạc ngay sau khi sử dụng</h3>
      <p>Để pin nguội 15-30 phút trước khi sạc, tránh nhiệt độ cao ảnh hưởng đến tuổi thọ.</p>
      
      <h3>3. Bảo quản ở nơi khô ráo, thoáng mát</h3>
      <p>Tránh để xe dưới trời nắng nóng hoặc mưa ẩm kéo dài.</p>
      
      <h3>4. Sử dụng sạc chính hãng</h3>
      <p>Sạc kém chất lượng có thể làm giảm tuổi thọ pin đáng kể.</p>
      
      <h3>5. Không để pin hết hoàn toàn</h3>
      <p>Pin Lithium bị ảnh hưởng nghiêm trọng nếu thường xuyên xả hết điện.</p>
      
      <h3>6. Vệ sinh cực pin định kỳ</h3>
      <p>Lau sạch bụi bẩn, ô xy hóa tại các cực nối để đảm bảo tiếp xúc tốt.</p>
      
      <h3>7. Kiểm tra và bơm lốp đúng áp suất</h3>
      <p>Lốp non làm tăng tiêu hao năng lượng, giảm quãng đường di chuyển.</p>
      
      <h3>8. Lái xe êm ái, tránh tăng tốc đột ngột</h3>
      <p>Phong cách lái xe ảnh hưởng lớn đến tuổi thọ pin.</p>
      
      <h3>9. Sử dụng xe định kỳ</h3>
      <p>Nếu không dùng xe trong thời gian dài, nên sạc pin mỗi tháng một lần.</p>
      
      <h3>10. Kiểm tra và bảo dưỡng định kỳ</h3>
      <p>Đưa xe đi kiểm tra tại trung tâm bảo hành mỗi 3-6 tháng.</p>
      
      <h2>Kết luận</h2>
      <p>Việc tuân thủ những mẹo trên sẽ giúp pin của bạn kéo dài tuổi thọ lên 30-50%, tiết kiệm đáng kể chi phí trong dài hạn.</p>
    `,
    author: {
      name: "Lê Minh Châu",
      avatar: "https://ui-avatars.com/api/?name=Le+Minh+Chau&background=00c9a7&color=fff",
      role: "Chuyên viên bảo dưỡng"
    },
    category: "Bảo dưỡng",
    tags: ["bảo dưỡng", "pin", "mẹo hay"],
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop",
    publishedAt: "2025-10-15T09:00:00Z",
    views: 2341,
    readTime: 6,
    featured: false
  },
  {
    id: 4,
    title: "Xu hướng xe điện 2025: Những công nghệ đột phá",
    slug: "xu-huong-xe-dien-2025",
    excerpt: "Khám phá những công nghệ mới nhất trong ngành xe điện sẽ thay đổi cách chúng ta di chuyển trong tương lai.",
    content: `
      <h2>Ngành xe điện đang phát triển như thế nào?</h2>
      <p>Năm 2025 đánh dấu bước ngoặt quan trọng trong ngành xe điện với nhiều công nghệ đột phá được ứng dụng thực tế.</p>
      
      <h3>1. Pin sạc siêu nhanh</h3>
      <p>Công nghệ pin mới cho phép sạc đầy 80% chỉ trong 15-20 phút, giải quyết nỗi lo về thời gian sạc lâu.</p>
      
      <h3>2. Trí tuệ nhân tạo (AI) trong xe</h3>
      <p>Hệ thống AI giúp tối ưu hóa tiêu thụ năng lượng, dự đoán quãng đường di chuyển và cảnh báo bảo dưỡng tự động.</p>
      
      <h3>3. Kết nối IoT</h3>
      <p>Xe có thể kết nối với smartphone, cho phép theo dõi tình trạng xe, khóa/mở xe từ xa, và tìm điểm sạc gần nhất.</p>
      
      <h3>4. Pin thể rắn (Solid-state battery)</h3>
      <p>Loại pin mới này có mật độ năng lượng cao hơn 50% so với pin Lithium-ion thông thường, an toàn và tuổi thọ cao hơn.</p>
      
      <h3>5. Hệ thống thu hồi năng lượng thông minh</h3>
      <p>Công nghệ mới giúp thu hồi năng lượng hiệu quả hơn khi phanh, tăng 15-20% quãng đường di chuyển.</p>
      
      <h2>Dự báo thị trường</h2>
      <p>Theo các chuyên gia, đến năm 2030, 70% xe máy mới bán ra tại Việt Nam sẽ là xe điện. Giá thành xe điện dự kiến sẽ ngang bằng hoặc rẻ hơn xe xăng trong 3-5 năm tới.</p>
      
      <h2>Kết luận</h2>
      <p>Những công nghệ mới này không chỉ làm xe điện trở nên tiện lợi hơn mà còn góp phần bảo vệ môi trường và tiết kiệm chi phí cho người dùng.</p>
    `,
    author: {
      name: "Phạm Đức Anh",
      avatar: "https://ui-avatars.com/api/?name=Pham+Duc+Anh&background=00c9a7&color=fff",
      role: "Nhà phân tích công nghệ"
    },
    category: "Công nghệ",
    tags: ["xu hướng", "công nghệ", "2025"],
    thumbnail: "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=800&h=500&fit=crop",
    publishedAt: "2025-10-10T16:00:00Z",
    views: 3456,
    readTime: 8,
    featured: true
  },
  {
    id: 5,
    title: "Kinh nghiệm mua xe máy điện cũ: Những điều cần lưu ý",
    slug: "kinh-nghiem-mua-xe-may-dien-cu",
    excerpt: "Hướng dẫn chi tiết giúp bạn kiểm tra và lựa chọn xe máy điện cũ chất lượng, tránh mua phải hàng kém.",
    content: `
      <h2>Tại sao nên mua xe máy điện cũ?</h2>
      <p>Xe máy điện cũ là lựa chọn hợp lý cho người có ngân sách hạn chế nhưng vẫn muốn sử dụng phương tiện thân thiện với môi trường.</p>
      
      <h2>Kiểm tra những gì khi mua xe cũ?</h2>
      
      <h3>1. Kiểm tra pin</h3>
      <p>Đây là phần quan trọng nhất. Cần kiểm tra:</p>
      <ul>
        <li>Dung lượng pin còn lại (nên trên 70%)</li>
        <li>Số lần sạc/xả (nếu có thông tin)</li>
        <li>Thời gian sạc đầy (so với thông số kỹ thuật)</li>
        <li>Quãng đường thực tế sau một lần sạc</li>
      </ul>
      
      <h3>2. Kiểm tra khung xe</h3>
      <p>Xem xét kỹ các vết xước, móp méo, hàn vá. Tránh xe từng bị tai nạn nghiêm trọng.</p>
      
      <h3>3. Kiểm tra hệ thống điện</h3>
      <p>Test tất cả đèn, còi, đồng hồ, và các tính năng điện tử khác.</p>
      
      <h3>4. Thử lái</h3>
      <p>Đi thử ít nhất 5-10km để kiểm tra:</p>
      <ul>
        <li>Tốc độ tối đa</li>
        <li>Khả năng tăng tốc</li>
        <li>Hệ thống phanh</li>
        <li>Tiếng động bất thường</li>
      </ul>
      
      <h3>5. Kiểm tra giấy tờ</h3>
      <p>Đảm bảo xe có đầy đủ:</p>
      <ul>
        <li>Biển số hợp lệ</li>
        <li>Giấy đăng ký xe</li>
        <li>Hợp đồng mua bán rõ ràng</li>
        <li>Sổ bảo hành (nếu còn)</li>
      </ul>
      
      <h2>Mức giá tham khảo</h2>
      <p>Xe đã sử dụng 1-2 năm thường giảm giá 30-40% so với xe mới. Xe từ 3 năm trở lên giảm 50-60%.</p>
      
      <h2>Lời khuyên từ chuyên gia</h2>
      <blockquote>
        "Nên mua xe cũ từ các cửa hàng uy tín hoặc người quen để đảm bảo chất lượng và có bảo hành sau bán hàng." - Chuyên gia Nguyễn Văn Dũng
      </blockquote>
      
      <h2>Kết luận</h2>
      <p>Mua xe máy điện cũ có thể tiết kiệm nhiều chi phí nếu bạn biết cách kiểm tra và lựa chọn kỹ lưỡng. Hãy dành thời gian tìm hiểu và so sánh nhiều xe trước khi quyết định.</p>
    `,
    author: {
      name: "Nguyễn Văn Dũng",
      avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+Dung&background=00c9a7&color=fff",
      role: "Chuyên gia thẩm định xe"
    },
    category: "Hướng dẫn",
    tags: ["mua xe cũ", "kinh nghiệm", "kiểm tra xe"],
    thumbnail: "https://images.unsplash.com/photo-1558980663-3685c1d673c4?w=800&h=500&fit=crop",
    publishedAt: "2025-10-05T11:00:00Z",
    views: 1876,
    readTime: 9,
    featured: false
  },
  {
    id: 6,
    title: "Chính sách ưu đãi xe điện 2025: Cơ hội tiết kiệm lớn",
    slug: "chinh-sach-uu-dai-xe-dien-2025",
    excerpt: "Tổng hợp các chính sách hỗ trợ và ưu đãi từ nhà nước và các hãng xe để mua xe điện tiết kiệm nhất.",
    content: `
      <h2>Các chính sách ưu đãi từ Nhà nước</h2>
      
      <h3>1. Miễn phí trước bạ</h3>
      <p>Từ tháng 1/2025, xe máy điện được miễn 100% lệ phí trước bạ, tiết kiệm 2-4 triệu đồng tùy loại xe.</p>
      
      <h3>2. Giảm lãi suất vay</h3>
      <p>Các ngân hàng áp dụng lãi suất ưu đãi 5-7%/năm cho vay mua xe điện, thấp hơn 2-3% so với xe xăng.</p>
      
      <h3>3. Trợ giá pin</h3>
      <p>Chính phủ hỗ trợ 20% chi phí mua pin mới khi thay thế pin cũ, tối đa 5 triệu đồng.</p>
      
      <h3>4. Miễn phí đỗ xe</h3>
      <p>Xe điện được miễn phí đỗ xe tại các bãi công cộng ở TP.HCM và Hà Nội đến hết 2025.</p>
      
      <h2>Ưu đãi từ các hãng xe</h2>
      
      <h3>VinFast</h3>
      <ul>
        <li>Giảm giá 5-10 triệu đồng cho khách hàng đổi xe cũ lấy xe mới</li>
        <li>Bảo hành pin 7 năm</li>
        <li>Tặng 1 năm bảo hiểm</li>
      </ul>
      
      <h3>Yadea</h3>
      <ul>
        <li>Trả góp 0% trong 12 tháng</li>
        <li>Tặng thêm pin dự phòng (trị giá 3 triệu)</li>
        <li>Bảo hành 5 năm</li>
      </ul>
      
      <h3>Pega</h3>
      <ul>
        <li>Ưu đãi 3-5 triệu khi mua combo xe + phụ kiện</li>
        <li>Bảo hành mở rộng 4 năm</li>
      </ul>
      
      <h2>Cách tận dụng ưu đãi hiệu quả</h2>
      <ol>
        <li>So sánh giá và ưu đãi từ nhiều đại lý khác nhau</li>
        <li>Mua vào các đợt khuyến mãi lớn (Tết, Black Friday)</li>
        <li>Đăng ký sớm để nhận ưu đãi đặt cọc</li>
        <li>Tham gia các chương trình trade-in nếu có xe cũ</li>
      </ol>
      
      <h2>Tính toán cụ thể</h2>
      <p>Ví dụ mua xe VinFast Evo200 giá 25 triệu:</p>
      <ul>
        <li>Giá niêm yết: 25.000.000đ</li>
        <li>Giảm trước bạ: -2.500.000đ</li>
        <li>Ưu đãi hãng: -3.000.000đ</li>
        <li>Tổng chi phí thực tế: 19.500.000đ</li>
      </ul>
      <p><strong>Tiết kiệm: 5.500.000đ (22%)</strong></p>
      
      <h2>Kết luận</h2>
      <p>Đây là thời điểm vàng để mua xe điện với nhiều ưu đãi hấp dẫn. Hãy nhanh tay tận dụng các chính sách này!</p>
    `,
    author: {
      name: "Hoàng Thu Hà",
      avatar: "https://ui-avatars.com/api/?name=Hoang+Thu+Ha&background=00c9a7&color=fff",
      role: "Chuyên viên tư vấn"
    },
    category: "Tin tức",
    tags: ["chính sách", "ưu đãi", "tiết kiệm"],
    thumbnail: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=500&fit=crop",
    publishedAt: "2025-10-01T08:00:00Z",
    views: 4521,
    readTime: 7,
    featured: true
  }
];

export const blogCategories = [
  { id: "all", name: "Tất cả" },
  { id: "Hướng dẫn", name: "Hướng dẫn" },
  { id: "Công nghệ", name: "Công nghệ" },
  { id: "Bảo dưỡng", name: "Bảo dưỡng" },
  { id: "Tin tức", name: "Tin tức" },
  { id: "Kinh nghiệm", name: "Kinh nghiệm" }
];

export const popularTags = [
  "xe điện",
  "pin",
  "bảo dưỡng",
  "công nghệ",
  "mua xe",
  "tiết kiệm",
  "môi trường",
  "ưu đãi"
];