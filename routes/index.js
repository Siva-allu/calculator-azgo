var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
})

// maps to store result of each result and number of operation for each initialized calculator.
var totalOpsMap=new Map();
var resultMap = new Map();


router.post('/init',(req,res)=>{
let {operator,num1,num2}=req.query;
if (operator==undefined || num1==undefined || num2==undefined){
  res.status(400).json({
    message:"Missing Values.Please Check"
  });
  return ;

}
num1=parseInt(num1);
num2=parseInt(num2);

let id = idGenerator();
let tempRes;
switch(operator){
  case 'add':   
    tempRes=num1+num2;
    resultMap.set(id,[tempRes]);
    break;
  case 'sub':
    tempRes=num1-num2;
    resultMap.set(id,[tempRes]);
    break;
  case 'mul':
    tempRes=num1*num2;
    resultMap.set(id,[tempRes]);
    break;
  case 'div':
    tempRes=num1/num2;
    resultMap.set(id,[tempRes]);
    break;
}
totalOpsMap.set(id,1);
res.status(200).json({
  result:getResult(id),
  totalOps: totalOpsMap.get(id),
  id:id
});
});

router.post('/operation',(req,res)=>{
  let {operator,num,id}=req.query;
  if (operator==undefined || num == undefined || id==undefined){
    res.status(400).json({
      message:"Missing Values.Please Check"
    });
    return ;
  }
  num=parseInt(num);
  id=parseInt(id);
  if (resultMap.has(id)==false){
    res.status(400).json({
      message:"Calculator "+id+" is not initialized."
    });
    return ;
  }
  performOperation(id,num,operator);
  totalOpsMap.set(id,totalOpsMap.get(id)+1);
  res.status(200).json({
    result:getResult(id),
    totalOps: totalOpsMap.get(id),
    id:id
  });
  });

router.put('/undo',(req,res)=>{
  let {id}=req.query;
  if(id == undefined){
    res.status(400).json({
      message:"Missing Values.Please Check"
    });
    return ;
  }
  id=parseInt(id);
  if (resultMap.has(id)==false){
    res.status(400).json({
      message:"Calculator "+id+" is not initialized."
    });
    return ;
  }
  if (totalOpsMap.get(id)==1){
    res.status(200).json({
      result:getResult(id),
      totalOps:totalOpsMap.get(id)
    })
    return ;
  }
    undoOperation(id);
    totalOpsMap.set(id,totalOpsMap.get(id)-1);
    res.status(200).json({
      result:getResult(id),
      totalOps: totalOpsMap.get(id)
    });

});

router.get('/reset',(req,res)=>{
  let {id}=req.query;
  id=parseInt(id);
  if(id == undefined){
    res.status(400).json({
      message:"Missing Values.Please Check"
    });
    return ;
  }
  if(resultMap.delete(id) && totalOpsMap.delete(id)){
    res.status(200).json({
      success: true,
      message: 'calculator '+id+' is now reset.'
    })
  }else{
    res.status(200).json({
      success: false,
      message: 'calculator '+id+' is not initialized.'
    })
  }
})




//helper functions

//generate id for caculator
function idGenerator(){
  i=1
  while (resultMap.has(i)){
    i++;
  }
  return i
}

//retrieve the latest calculation.
function getResult(id){
  temp=resultMap.get(id);
  return temp[temp.length -1];
}

//to perform operation  
function performOperation(id,num,operator){
  temp=resultMap.get(id);
  switch(operator){
    case 'add':
      temp.push(temp[temp.length-1]+num);
      break;
    case 'sub':
      temp.push(temp[temp.length-1]-num);
      break;
    case 'mul':
      temp.push(temp[temp.length-1]*num);
      break;
    case 'div':
      temp.push(temp[temp.length-1]/num);
      break;
  }
  resultMap.set(id,temp);
}

//undo calculation
function undoOperation(id){
  temp=resultMap.get(id);
  temp.pop();
  resultMap.set(id,temp);
}

module.exports = router;
