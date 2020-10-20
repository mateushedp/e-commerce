// const deleteProduct = (btn) => {
//     console.log('clicked');
    
//     const productId = btn.parentNode.querySelector('[name=id]').value;
//     const csrf = btn.parentNode.querySelector('[name=_csrf]').value

//     fetch('/admin/product/' + productId, {
//         method: 'DELETE',
//         headers: {
//             'csrf-token': csrf
//         }
//     })
//     .then(result => {console.log(result)})
//     .catch(error => {console.log(error)});
// };