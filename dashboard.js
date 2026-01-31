// Biến lưu trữ danh sách sản phẩm gốc
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let pageSize = 10;
let sortColumn = null;
let sortDirection = 'asc';

// Hàm getAll để lấy tất cả sản phẩm từ API
async function getAll() {
  try {
    const response = await fetch('https://api.escuelajs.co/api/v1/products');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu:', error);
    throw error;
  }
}

// Hàm xử lý URL ảnh
function getImageUrl(images) {
  if (!images || images.length === 0) {
    return 'https://via.placeholder.com/150?text=No+Image';
  }
  
  let imageUrl = images[0];
  
  // Xử lý trường hợp URL có dấu ngoặc vuông hoặc dấu ngoặc kép
  if (typeof imageUrl === 'string') {
    imageUrl = imageUrl.replace(/[\[\]"]/g, '').trim();
  }
  
  // Kiểm tra URL hợp lệ
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return 'https://via.placeholder.com/150?text=No+Image';
  }
  
  return imageUrl;
}

// Hàm sắp xếp sản phẩm
function sortProducts(column) {
  // Nếu click vào cùng cột, đổi chiều sắp xếp
  if (sortColumn === column) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = column;
    sortDirection = 'asc';
  }
  
  filteredProducts.sort((a, b) => {
    let valueA, valueB;
    
    if (column === 'title') {
      valueA = a.title.toLowerCase();
      valueB = b.title.toLowerCase();
    } else if (column === 'price') {
      valueA = a.price;
      valueB = b.price;
    }
    
    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });
  
  currentPage = 1; // Reset về trang 1 khi sắp xếp
  displayProducts(filteredProducts);
}

// Hàm hiển thị sản phẩm lên trang web dạng bảng
function displayProducts(products) {
  const contentDiv = document.getElementById('content');
  
  // Kiểm tra nếu không có sản phẩm
  if (products.length === 0) {
    contentDiv.innerHTML = '<div class="no-results">Không tìm thấy sản phẩm nào</div>';
    document.getElementById('pagination').innerHTML = '';
    return;
  }
  
  // Tính toán phân trang
  const totalPages = Math.ceil(products.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentProducts = products.slice(startIndex, endIndex);
  
  const table = document.createElement('table');
  table.className = 'products-table';
  
  // Tạo header của bảng với nút sắp xếp
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  // STT
  const th1 = document.createElement('th');
  th1.textContent = 'STT';
  headerRow.appendChild(th1);
  
  // Hình ảnh
  const th2 = document.createElement('th');
  th2.textContent = 'Hình ảnh';
  headerRow.appendChild(th2);
  
  // Tên sản phẩm (có sắp xếp)
  const th3 = document.createElement('th');
  th3.className = 'sortable';
  th3.innerHTML = `
    Tên sản phẩm 
    <span class="sort-icon">${sortColumn === 'title' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}</span>
  `;
  th3.onclick = () => sortProducts('title');
  headerRow.appendChild(th3);
  
  // Giá (có sắp xếp)
  const th4 = document.createElement('th');
  th4.className = 'sortable';
  th4.innerHTML = `
    Giá 
    <span class="sort-icon">${sortColumn === 'price' ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}</span>
  `;
  th4.onclick = () => sortProducts('price');
  headerRow.appendChild(th4);
  
  // Danh mục
  const th5 = document.createElement('th');
  th5.textContent = 'Danh mục';
  headerRow.appendChild(th5);
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  
  // Thêm từng sản phẩm vào bảng
  currentProducts.forEach((product, index) => {
    const row = document.createElement('tr');
    
    const td1 = document.createElement('td');
    td1.textContent = startIndex + index + 1;
    
    // Tạo gallery cho tất cả hình ảnh
    const td2 = document.createElement('td');
    const imageGallery = document.createElement('div');
    imageGallery.className = 'image-gallery';
    
    // Lấy tất cả hình ảnh (tối đa 3 hình)
    const images = product.images || [];
    const imagesToShow = images.slice(0, 3);
    
    imagesToShow.forEach(imageUrl => {
      const img = document.createElement('img');
      img.className = 'product-image';
      img.alt = product.title;
      img.referrerPolicy = 'no-referrer';
      
      // Xử lý URL ảnh
      let cleanUrl = imageUrl;
      if (typeof cleanUrl === 'string') {
        cleanUrl = cleanUrl.replace(/[\[\]"]/g, '').trim();
      }
      
      img.src = cleanUrl;
      img.onerror = function() {
        this.src = 'https://via.placeholder.com/80x80?text=No+Image';
      };
      
      imageGallery.appendChild(img);
    });
    
    // Nếu không có hình nào, hiển thị placeholder
    if (imagesToShow.length === 0) {
      const img = document.createElement('img');
      img.className = 'product-image';
      img.src = 'https://via.placeholder.com/80x80?text=No+Image';
      imageGallery.appendChild(img);
    }
    
    td2.appendChild(imageGallery);
    
    const td3 = document.createElement('td');
    td3.textContent = product.title;
    
    const td4 = document.createElement('td');
    td4.className = 'product-price';
    td4.textContent = `$${product.price}`;
    
    const td5 = document.createElement('td');
    const span = document.createElement('span');
    span.className = 'product-category';
    span.textContent = product.category.name;
    td5.appendChild(span);
    
    row.appendChild(td1);
    row.appendChild(td2);
    row.appendChild(td3);
    row.appendChild(td4);
    row.appendChild(td5);
    
    // Thêm description ẩn vào row
    const descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'product-description';
    descriptionDiv.innerHTML = `
      <div class="description-title">Mô tả sản phẩm:</div>
      ${product.description || 'Không có mô tả'}
    `;
    row.appendChild(descriptionDiv);
    
    tbody.appendChild(row);
  });
  
  contentDiv.innerHTML = '';
  contentDiv.appendChild(table);
  
  // Hiển thị phân trang
  displayPagination(products.length, totalPages);
}

// Hàm hiển thị lỗi
function displayError(message) {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = `<div class="error">${message}</div>`;
}

// Hàm hiển thị phân trang
function displayPagination(totalItems, totalPages) {
  const paginationDiv = document.getElementById('pagination');
  paginationDiv.innerHTML = '';
  
  if (totalPages <= 1) return;
  
  // Nút Previous
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '« Trước';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      displayProducts(filteredProducts);
    }
  };
  paginationDiv.appendChild(prevBtn);
  
  // Hiển thị các trang
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  // Trang đầu
  if (startPage > 1) {
    const firstBtn = document.createElement('button');
    firstBtn.textContent = '1';
    firstBtn.onclick = () => {
      currentPage = 1;
      displayProducts(filteredProducts);
    };
    paginationDiv.appendChild(firstBtn);
    
    if (startPage > 2) {
      const dots = document.createElement('span');
      dots.className = 'page-info';
      dots.textContent = '...';
      paginationDiv.appendChild(dots);
    }
  }
  
  // Các trang ở giữa
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    pageBtn.className = i === currentPage ? 'active' : '';
    pageBtn.onclick = () => {
      currentPage = i;
      displayProducts(filteredProducts);
    };
    paginationDiv.appendChild(pageBtn);
  }
  
  // Trang cuối
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const dots = document.createElement('span');
      dots.className = 'page-info';
      dots.textContent = '...';
      paginationDiv.appendChild(dots);
    }
    
    const lastBtn = document.createElement('button');
    lastBtn.textContent = totalPages;
    lastBtn.onclick = () => {
      currentPage = totalPages;
      displayProducts(filteredProducts);
    };
    paginationDiv.appendChild(lastBtn);
  }
  
  // Nút Next
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Sau »';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayProducts(filteredProducts);
    }
  };
  paginationDiv.appendChild(nextBtn);
  
  // Thông tin trang
  const info = document.createElement('span');
  info.className = 'page-info';
  info.textContent = `Trang ${currentPage}/${totalPages} (${totalItems} sản phẩm)`;
  paginationDiv.appendChild(info);
}

// Hàm tìm kiếm sản phẩm theo title
function searchProducts(searchTerm) {
  filteredProducts = allProducts.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  currentPage = 1; // Reset về trang 1 khi tìm kiếm
  displayProducts(filteredProducts);
}

// Tự động tải dữ liệu khi trang web được load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    allProducts = await getAll();
    filteredProducts = allProducts;
    displayProducts(filteredProducts);
    
    // Thêm sự kiện tìm kiếm
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
      searchProducts(e.target.value);
    });
    
    // Thêm sự kiện thay đổi số lượng hiển thị
    const pageSizeSelect = document.getElementById('pageSize');
    pageSizeSelect.addEventListener('change', (e) => {
      pageSize = parseInt(e.target.value);
      currentPage = 1; // Reset về trang 1
      displayProducts(filteredProducts);
    });
  } catch (error) {
    displayError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
  }
});
