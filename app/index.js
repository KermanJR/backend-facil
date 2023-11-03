
const express = require('express');
const Firebird = require('firebird-limber');
const cors = require('cors');
const app = express();
app.use(cors());

var options = {};

options.host = '127.0.0.1';
options.port = 3050;
options.database = 'C:/Ganso/Dados/Ganso.IB';
options.user = 'SYSDBA';
options.password = '1652498327';
options.lowercase_keys = false; 
options.role = null;            
options.pageSize = 4096;              
options.retryConnectionInterval = 1000; 
options.blobAsText = false;
options.encoding = 'UTF-8'


app.get('/produtos', (req, res) => {
  Firebird.attach(options, (err, db) => {
    if (err) {
      res.status(500).send('Erro ao conectar ao banco de dados: ' + err.message);
      return;
    }

    db.query(`select
    p.codigo,
    p.codigo_barra,
    p.descricao,
    ep.estoque,
    pp.preco_venda
    from produto p
    left join estoque_produto ep on ep.codigo_produto = p.codigo
    left join produto_parametros pp on pp.codigo_produto = p.codigo
    group by p.codigo,
    p.codigo_barra,
    p.descricao,
    ep.estoque,
    pp.preco_venda`, (err, result) => {
      
      if (err) {
        res.status(500).send('Erro ao executar consulta: ' + err.message);
      } else {
        console.log(JSON.stringify(result))
        res.json(result)
      }
      db.detach();
    });
  });
});


app.get('/produto/:id', (req, res) => {
    const parametro = req.params.id;
  
    Firebird.attach(options, (err, db) => {
      if (err) {
        res.status(500).send('Erro ao conectar ao banco de dados: ' + err.message);
        return;
      }
  
      let query;
    
      query = `
        select
        p.codigo,
        p.codigo_barra,
        p.descricao,
        ep.estoque,
        pp.preco_venda
        from produto p
        left join estoque_produto ep on ep.codigo_produto = p.codigo
        left join produto_parametros pp on pp.codigo_produto = p.codigo
        where p.codigo_barra  = ${parametro}
        group by p.codigo,
        p.codigo_barra,
        p.descricao,
        ep.estoque,
        pp.preco_venda`;
      db.query(query, (err, result) => {
        if (err) {
          res.status(500).send('Erro ao executar consulta: ' + err.message);
        } else {
          console.log(result)
          res.json(result);
        
        }
        db.detach();
      });
    });
  });

  app.get('/produto/buscar/:query', (req, res) => {
    let consulta = req.params.query;
    consulta = consulta.toUpperCase()


      let query = `
        select
        p.codigo,
        p.codigo_barra,
        p.descricao,
        ep.estoque,
        p.descricao,
        pp.preco_venda
        from produto p
        left join estoque_produto ep on ep.codigo_produto = p.codigo 
        left join produto_parametros pp on pp.codigo_produto = p.codigo
        where 
          p.descricao LIKE '%${consulta}%' 
        group by p.codigo,
        p.codigo_barra,
        p.descricao,
        ep.estoque,
        pp.preco_venda`;
    
      
    Firebird.attach(options, (err, db) => {
      if (err) {
        res.status(500).send('Erro ao conectar ao banco de dados: ' + err.message);
        return;
      }

      db.query(query, {encoding: 'utf-8'},(err, result) => {
        if (err) {
          res.status(500).send('Erro ao executar consulta: ' + err.message);
        } else {
          res.json(result);
        }
        db.detach();
      });
    });
  });
  



  

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Aplicação´~a~õ rodando na porta ${port}`);
});
