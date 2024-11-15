import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './data-source';
import familleRoutes from './routes/familleRoutes';
import articleRoutes from './routes/articleRoutes';
import stockRoutes from './routes/stockRoutes';
import segmentationRoutes from './routes/segmentationRoutes';
import clientRoutes from './routes/clientRoutes';
import moyenPaiementRoutes from './routes/moyenPaiementRoutes';
import factureArticleRoutes from './routes/factureArticleRoutes';
import devisRoutes from './routes/devisRoutes';
import historiqueFacturationRoutes from './routes/historiqueFacturationRoutes';
import fournisseurRoutes from './routes/fournisseurRoutes';
import factureAchatRoutes from './routes/factureAchatRoutes';
import historiqueFacturationAchatRoutes from './routes/historiqueFacturationAchatRoutes';
import commandeRoutes from './routes/commandeRoutes';
import machineRoutes from './routes/machineRoutes';
import vendeurRoutes from './routes/vendeurRoutes';
import priseEnChargeRoutes from './routes/priseEnChargeRoutes';
import serviceApresVenteRoutes from './routes/serviceApresVenteRoutes';
import ticketRoutes from './routes/ticketRoutes';
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import sousfamilleRoutes from './routes/sousfamilleRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Base configurations
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root route handler
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Kompass Business API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', articleRoutes);
app.use('/api', familleRoutes);
app.use('/api', stockRoutes);
app.use('/api', segmentationRoutes);
app.use('/api', clientRoutes);
app.use('/api', moyenPaiementRoutes);
app.use('/api', factureArticleRoutes);
app.use('/api/devis', devisRoutes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api/historique-facturation', historiqueFacturationRoutes);
app.use('/api/fournisseurs', fournisseurRoutes);
app.use('/api/factures-achat', factureAchatRoutes);
app.use('/api/historique-facturation-achat', historiqueFacturationAchatRoutes);
app.use('/api', commandeRoutes);
app.use('/api', machineRoutes);
app.use('/api', vendeurRoutes);
app.use('/api', priseEnChargeRoutes);
app.use('/api', serviceApresVenteRoutes);
app.use('/api', ticketRoutes);
app.use('/api/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/api', sousfamilleRoutes);

// Database initialization and server start
AppDataSource.initialize()
  .then(() => {
    console.log('Database connection established');
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });