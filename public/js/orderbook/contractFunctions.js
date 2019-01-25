/**
 * @def Balance of ERC20 (KNC and COIN) of user's wallet
 * @param {coinAddress, coinSymbol} required ERC20 address and symbol - DAI, KNC, etc
 */
function getBalance(coinAddress, coinSymbol) {
    coinPmlContract.getBalance(coinAddress, account, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            if (coinSymbol == "KNC") {
                KncDetails.balanceInWei = Number(res);
                KncDetails.balance = Number(res)/(10**KncDetails.decimals);
                modalDescUpdate(5);
            } else {
                coinDetails.balanceInWei = Number(res);
                coinDetails.balance = Number(res)/(10**coinDetails.decimals);
                modalDescUpdate(3);
            }
        }
    });
}

/**
 * @def Balance of ETH of user's wallet
 */
function ethBalance() {
    web3.eth.getBalance(account, function (err, res) {
        if (!err) {
            EthDetails.balanceInWei = Number(res);
            EthDetails.balance = Number(res)/(10**18);
            modalDescUpdate(1);
        } else {
            console.error(err);
        };
    });
}

/**
 * @def Check Allowance of ERC20 (KNC and COIN) to pml contract
 * @param {coinContract, coinSymbol} required coinContract(define coinContract to call it's functions) and symbol - DAI, KNC, etc
 */
function checkAllowance(coinContract, coinSymbol) {
    coinContract.allowance(account, ADD_coinPmlContract, function (err, res) {
        if (!err) {
            if (coinSymbol == "KNC") {
                KncDetails.allowance = Number(res);
            } else {
                coinDetails.allowance = Number(res);
            }
        } else {
            console.log(err);
        };
    })
}

/**
 * @def Approve of ERC20 (KNC and COIN) to pml contract
 * @param {coinContract, coinSymbol} required coinContract(define coinContract to call it's functions) and symbol - DAI, KNC, etc
 */
function approve(coinContract, coinSymbol) {
    coinContract.approve(ADD_coinPmlContract, 2**250, function (err, res) {
        if (!err) {
            if (coinSymbol == "KNC") {
                console.log(`${coinSymbol} - Approve`);
            } else {
                console.log(`${coinSymbol} - Approve`);
            }
            navAlerts(12);
            txArr.push(res);
            approvalEvent(coinContract);
        } else {
            alertVar = err.message;
            navAlerts(13);
        };
    });
}

/**
 * @def Approval event of ERC20 (KNC and COIN) to pml contract
 * @param {coinContract} required coinContract(define coinContract to call it's functions)
 */
function approvalEvent(coinContract) {
    coinContract.Approval({}, 'latest').watch(function (err, event) {
        if (!err) {
            var eventTx = event.transactionHash;
            if (txArr.includes(eventTx)) {
                if (!event.removed) {
                    navAlerts(14);
                    checkAllowance(CoinERC20Contract, coinDetails.symbol);
                    checkAllowance(KncERC20Contract, KncDetails.symbol);
                }
            }
        }
    });
}

/**
 * @def pmlReserve function to deposit ETH for orderbook
 * @param {amount} required amount of ETH to deposit in WEI
 */
function depositEther(amount) {
    var payObj = {
        value: amount
    }
    coinPmlContract.depositEther(account, payObj, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            alertVar = "ETH";
            navAlerts(15);
            console.log('Deposit Ether transaction');
        }
    });
}

/**
 * @def pmlReserve function to withdraw ETH for orderbook
 * @param {amount} required amount of ETH to withdraw in WEI
 */
function withdrawEther(amount) {
    coinPmlContract.withdrawEther(amount, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            alertVar = "ETH";
            navAlerts(16);
            console.log('Withdraw Ether transaction');
        }
    });
}

/**
 * @def pmlReserve function to deposit KNC for fees for orderbook
 * @param {amount} required amount of KNC to deposit in WEI
 */
function depositKnc(amount) {
    if (KncDetails.allowance < amount) {
        alertVar = "KNC";
        navAlerts(17);
        approve(KncERC20Contract, KncDetails.symbol);
        console.log('confirm approve first');
    } else {
        coinPmlContract.depositKncForFee(account, amount, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                alertVar = "KNC";
                navAlerts(15);
                console.log('Deposit KNC transaction');
            }
        });
    }
}

/**
 * @def pmlReserve function to withdraw KNC for orderbook
 * @param {amount} required amount of KNC to withdraw in WEI
 */
function withdrawKnc(amount) {
    coinPmlContract.withdrawKncFee(amount, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            alertVar = "KNC";
            navAlerts(16);
            console.log('Withdraw KNC transaction');
        }
    })
}

/**
 * @def pmlReserve function to deposit token for orderbook
 * @param {amount} required amount of token to deposit in WEI
 */
function depositCoin(amount) {
    if (KncDetails.allowance < amount) {
        alertVar = coinDetails.symbol;
        navAlerts(17);
        approve(CoinERC20Contract, coinDetails.symbol);
        console.log('confirm approve first');
    } else {
        coinPmlContract.depositToken(account, amount, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                alertVar = coinDetails.symbol;
                navAlerts(15);
                console.log('Deposit Coin transaction');
            }
        });
    }
}

/**
 * @def pmlReserve function to withdraw token for orderbook
 * @param {amount} required amount of token to withdraw in WEI
 */
function withdrawCoin(amount) {
    coinPmlContract.withdrawToken(amount, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            alertVar = coinDetails.symbol;
            navAlerts(16);
            console.log('Withdraw Coin transaction');
        }
    });
}

/**
 * @def pmlReserve function to get user's deposited funds which are not in use
 * @param {coinAddress, coinSymbol} required address of ERC20 and symbol - DAI, KNC, etc
 */
function makerFunds(coinAddress, coinSymbol) {
    coinPmlContract.makerFunds(account, coinAddress, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            if (coinSymbol == "ETH") {
                EthDetails.fundsInWei = Number(res);
                EthDetails.funds = Number(res)/(10**18);
                totalAssets.eth += EthDetails.funds;
                totalAssets.ethInWei += EthDetails.fundsInWei;
                modalDescUpdate(2);
                $('#ethUnlocked').text(EthDetails.funds);
                $('#ethTotal').text(totalAssets.eth);
                $('#ethValue').text(totalAssets.eth*EthDetails.USD);
            } else {
                coinDetails.fundsInWei = Number(res);
                coinDetails.funds = Number(res)/(10**coinDetails.decimals);
                totalAssets.coin += coinDetails.funds;
                totalAssets.coinInWei += coinDetails.fundsInWei;
                modalDescUpdate(4);
                $('#tokenUnlocked').text(coinDetails.funds);
                $('#tokenTotal').text(totalAssets.coin);
                $('#tokenValue').text(totalAssets.coin*coinDetails.USD);
            }
        }
    });
}

/**
 * @def pmlReserve function to get user's deposited KNC for fees which are not in use
 */
function makerKnc() {
    coinPmlContract.makerKnc(account, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            KncDetails.fundsInWei = Number(res);
            KncDetails.funds = Number(res)/(10**18);
            totalAssets.knc += KncDetails.funds;
            totalAssets.kncInWei += KncDetails.fundsInWei;
            modalDescUpdate(6);
            $('#kncUnlocked').text(KncDetails.funds);
            $('#kncTotal').text(totalAssets.knc);
            $('#kncValue').text(totalAssets.knc*KncDetails.USD);
        }
    });
}


// ETH to Token orders
/**
 * @def pmlReserve function to submit ETH TO TOKEN order
 * @param {srcAmt, dstAmt} required ETH amount as source in WEI and Token amount as dest in WEI
 */
function submitEthToCoinOrder(srcAmt, dstAmt) {
    coinPmlContract.submitEthToTokenOrder(srcAmt, dstAmt, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            navAlerts(18);
            console.log(res);
        }
    })
}

/**
 * @def pmlReserve function to update ETH TO TOKEN order
 * @param {id, srcAmt, dstAmt} required 
 * id - order id to get and update the order
 * ETH amount as source in WEI and Token amount as dest in WEI
 */
function updateEthToCoinOrder(id, srcAmt, dstAmt) {
    coinPmlContract.updateEthToTokenOrder(id, srcAmt, dstAmt, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            navAlerts(19);
            console.log(res);
        }
    })
}

/**
 * @def pmlReserve function to update ETH TO TOKEN order
 * @param {id} required id - order id to get and cancel the order
 */
function cancelEthToCoinOrder(id) {
    coinPmlContract.cancelEthToTokenOrder(id, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            navAlerts(20);
            console.log(res);
        }
    });
}

/**
 * @def pmlReserve function to get all the user's orders of ETH TO TOKEN
 */
function getEthToCoinMakerOrders() {
    coinPmlContract.getEthToTokenMakerOrderIds(account, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            if (res.length > 0) {
                $('#ethToTokenOrdersTitle').css('display', 'block');
            }
            for (i = 0; i < res.length; i++) {
                getEthToCoinOrderById(res[i].c[0]);
            }
        }
    });
}

/**
 * @def pmlReserve function to get ETH TO TOKEN order details
 * @param {id} required id - order id
 */
function getEthToCoinOrderById(id) {
    coinPmlContract.getEthToTokenOrder(id, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            usersOrdersEth[id] = res;
            usersOrdersEth.valueInWei += Number(res[1]);
            usersOrdersEth.value += Number(res[1])/10**18;
            totalAssets.ethInWei += usersOrdersEth.valueInWei;
            totalAssets.eth += usersOrdersEth.value;
            $('#ethLocked').text(usersOrdersEth.value);
            $('#ethTotal').text(totalAssets.eth);
            $('#ethValue').text(totalAssets.eth*EthDetails.USD);
            updateAllOrdersUI(id, 1);
        }
    });
}

/**
 * @def pmlReserve function to get ETH TO TOKEN full orderbook
 */
function getEthToCoinOrder() {
    coinPmlContract.getEthToTokenOrderList((err, res) => {
        if (err) {
            console.log(err);
        } else {
            for (i = 0; i < res.length; i++) {
                console.log(res[i].c[0]);
            }
        }
    })
}


// Token to ETH orders
/**
 * @def pmlReserve function to submit TOKEN TO ETH order
 * @param {srcAmt, dstAmt} required TOKEN amount as source in WEI and ETH amount as dest in WEI
 */
function submitCoinToEthOrder(srcAmt, dstAmt) {
    coinPmlContract.submitTokenToEthOrder(srcAmt, dstAmt, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            navAlerts(18);
            console.log(res);
        }
    })
}

/**
 * @def pmlReserve function to update TOKEN TO ETH order
 * @param {id, srcAmt, dstAmt} required 
 * id - order id to get and update the order
 * TOKEN amount as source in WEI and ETH amount as dest in WEI
 */
function updateCoinToEthOrder(id, srcAmt, dstAmt) {
    coinPmlContract.updateTokenToEthOrder(id, srcAmt, dstAmt, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            navAlerts(19);
            console.log(res);
        }
    })
}

/**
 * @def pmlReserve function to update TOKEN TO ETH order
 * @param {id} required id - order id to get and cancel the order
 */
function cancelCoinToEthOrder(id) {
    coinPmlContract.cancelTokenToEthOrder(id, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            navAlerts(20);
            console.log(res);
        }
    })
}

/**
 * @def pmlReserve function to get all the user's orders of TOKEN TO ETH
 */
function getCoinToEthMakerOrders() {
    coinPmlContract.getTokenToEthMakerOrderIds(account, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            if (res.length > 0) {
                $('#tokenToEthOrdersTitle').css('display', 'block');
                for (i = 0; i < res.length; i++) {
                    getCoinToEthOrderById(res[i].c[0]);
                }
            }
        }
    });
}

/**
 * @def pmlReserve function to get TOKEN TO ETH order details
 * @param {id} required id - order id
 */
function getCoinToEthOrderById(id) {
    coinPmlContract.getTokenToEthOrder(id, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            usersOrdersToken[id] = res;
            usersOrdersToken.valueInWei += Number(res[1]);
            usersOrdersToken.value += Number(res[1])/10**(coinDetails.decimals);
            totalAssets.coin += usersOrdersToken.value;
            totalAssets.coinInWei += usersOrdersToken.valueInWei;
            $('#tokenLocked').text(usersOrdersToken.value);
            $('#tokenTotal').text(totalAssets.coin);
            $('#tokenValue').text(totalAssets.coin*coinDetails.USD);
            updateAllOrdersUI(id, 2);
        }
    });
}

/**
 * @def pmlReserve function to get TOKEN TO ETH full orderbook
 */
function getCoinToEthOrder() {
    coinPmlContract.getTokenToEthOrderList((err, res) => {
        if (err) {
            console.log(err);
        } else {
            for (i = 0; i < res.length; i++) {
                console.log(res[i].c[0]);
            }
        }
    });
}