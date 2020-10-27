const deleteProduct = (btn) => {
    console.log('clicked');
    
    const productId = btn.parentNode.querySelector('[name=id]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value

    const productElement = btn.closest('[class="product-card"]');

    fetch('/admin/product/' + productId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
    .then(result => {
        productElement.parentNode.removeChild(productElement);
        return result.json();

    })
    .catch(error => {console.log(error)});
};