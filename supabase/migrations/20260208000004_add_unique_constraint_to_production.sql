-- Dodavanje unikatnog ključa za sprečavanje duplikata pri importu
ALTER TABLE proizvodnja_betona 
ADD CONSTRAINT unique_betonara_record UNIQUE (betonara_id, proizvodni_zapis_br);
